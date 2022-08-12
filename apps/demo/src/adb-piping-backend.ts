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
    let uploadReadableStreamController: ReadableStreamDefaultController<Uint8Array> | undefined = undefined;
    const uploadReadableStream = new ReadableStream<Uint8Array>({
      start(ctrl) {
        uploadReadableStreamController = ctrl;
      }
    });
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

    const writableStream = new WritableStream({
      write: (chunk) => {
        uploadReadableStreamController!.enqueue(chunk);
      },
    }, {
      highWaterMark: 16 * 1024,
      size(chunk) { return chunk.byteLength; },
    });

    return {
      readable: new WrapReadableStream(scReadableStream as YumeChanReadableStream<Uint8Array>)
        .pipeThrough(new StructDeserializeStream(AdbPacket)),
      writable: pipeFrom(
        new WrapWritableStream(writableStream as YumeChanWritableStream),
        new AdbPacketSerializeStream()
      ),
    };
  }
}
