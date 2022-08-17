import { AdbPacket, AdbPacketSerializeStream, type AdbBackend } from '@yume-chan/adb';
import {
  pipeFrom,
  ReadableStream as YumeChanReadableStream,
  StructDeserializeStream,
  WrapReadableStream, WrapWritableStream,
  WritableStream as YumeChanWritableStream,
} from '@yume-chan/stream-extra';

export class AdbPipingBackend implements AdbBackend {
  public readonly serial: string;
  public readonly name: string | undefined = undefined;

  public constructor(private params: {
    csUrl: string,
    scUrl: string,
    csHeaders: Headers | undefined,
    scHeaders: Headers | undefined,
  }) {
    this.serial = `piping_${params.csUrl}_${params.scUrl}`;
  }

  public async connect() {
    const {readable: uploadReadableStream, writable: uploadWritableStream} = new TransformStream<Uint8Array>();
    fetch(this.params.csUrl, {
      method: "POST",
      headers: this.params.csHeaders,
      body: uploadReadableStream,
      duplex: "half",
    } as RequestInit);

    const scResReaderPromise = (async () => {
      const scRes = await fetch(this.params.scUrl, {
        headers: this.params.scHeaders,
      });
      return scRes.body!.getReader();
    })();
    const scReadableStream = new ReadableStream({
      async pull(ctrl) {
        const reader = await scResReaderPromise;
        const result = await reader.read();
        if (result.done) {
          ctrl.close();
          return;
        }
        ctrl.enqueue(result.value);
      }
    });

    return {
      readable: new WrapReadableStream(scReadableStream as YumeChanReadableStream<Uint8Array>)
        .pipeThrough(new StructDeserializeStream(AdbPacket)),
      writable: pipeFrom(
        new WrapWritableStream(uploadWritableStream as YumeChanWritableStream),
        new AdbPacketSerializeStream()
      ),
    };
  }
}
