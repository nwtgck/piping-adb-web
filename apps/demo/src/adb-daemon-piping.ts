import { AdbPacket, AdbPacketSerializeStream, type AdbDaemonDevice } from '@yume-chan/adb';
import {
  Consumable, ConsumableWritableStream,
  DuplexStreamFactory,
  pipeFrom,
  ReadableStream as YumeChanReadableStream,
  StructDeserializeStream,
} from '@yume-chan/stream-extra';

export class AdbDaemonPipingDevice implements AdbDaemonDevice {
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
    })()

    const scReadableStream = new ReadableStream<Uint8Array>({
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

    const duplex = new DuplexStreamFactory<
        Uint8Array,
        Consumable<Uint8Array>
    >({
      close: () => {
        // TODO: impl
        console.log("TODO: close");
      },
    });

    const readable = duplex.wrapReadable(scReadableStream as YumeChanReadableStream);
    const uploadWritableStreamWriter = uploadWritableStream.getWriter();
    const writable = duplex.createWritable(new ConsumableWritableStream({
      async write(chunk) {
        await uploadWritableStreamWriter.write(chunk);
      }
    }));

    return {
      readable: readable.pipeThrough(new StructDeserializeStream(AdbPacket)),
      writable: pipeFrom(writable, new AdbPacketSerializeStream()),
    };
  }
}
