import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  DEFAULT_AUTOHOST_LIST_RESPONSE,
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_GAME_LIST,
} from "./HeaderConstants";

export interface ServerAutohostListResponse extends AbstractPackage {
  autohosts: Array<Autohost>;
}


export interface Autohost {
  autohostId: number;
  name: string;
  autostart: number;
  gamesLimit: number;
  increment: number;
  spaceId: number;
}


export class ServerAutohostListResponseConverter extends AbstractConverter {
  public assembly(data: ServerAutohostListResponse) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_GAME_LIST);
    dataBuffer.putUint32(data.autohosts.length);

    let autohostsConverter = new AutohostConverter();

    data.autohosts.forEach(
      (element) =>
        dataBuffer.putByteArray(
          new Uint8Array(autohostsConverter.assembly(element))
        ),
      this
    );

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ServerAutohostListResponse {
    const countAutohosts = dataBuffer.getUint32();

    let autohosts: Array<Autohost> = [];

    let autohostsConverter = new AutohostConverter();

    for (let i = 0; i < countAutohosts; ++i)
    autohosts[autohosts.length] = autohostsConverter.parse(dataBuffer);

    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_AUTOHOST_LIST_RESPONSE,
      autohosts,
    };
  }
}

class AutohostConverter {
  public assembly(data: Autohost) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(10));
    dataBuffer.putUint32( data.autohostId );
    dataBuffer.putNullTerminatedString( data.name );
    dataBuffer.putUint32( data.autostart );
    dataBuffer.putUint32( data.gamesLimit );
    dataBuffer.putUint32( data.increment );
    dataBuffer.putUint32( data.spaceId );

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): Autohost {
    return {
      autohostId: dataBuffer.getUint32( ),
      name: dataBuffer.getNullTerminatedString( ),
      autostart: dataBuffer.getUint32( ),
      gamesLimit: dataBuffer.getUint32( ),
      increment: dataBuffer.getUint32( ),
      spaceId: dataBuffer.getUint32( ),
    }
  }
}