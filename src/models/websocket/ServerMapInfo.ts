import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractPackage, AbstractConverter } from "./AbstractPackage";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_MAP_INFO,
} from "./HeaderConstants";

export interface ServerMapInfo extends AbstractPackage {
  readonly context: number;
  readonly type: number;

  mapName: string;
  tga: ArrayBuffer;
  author: string;
  description: string;
  players: string;
}

export class ServerMapInfoConverter extends AbstractConverter {
  public assembly(data: ServerMapInfo) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_MAP_INFO);

    dataBuffer.putNullTerminatedString(data.mapName);

    dataBuffer.putUint32(data.tga.byteLength);
    dataBuffer.putByteArray(new Uint8Array(data.tga));

    dataBuffer.putNullTerminatedString(data.author);
    dataBuffer.putNullTerminatedString(data.description);
    dataBuffer.putNullTerminatedString(data.players);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ServerMapInfo {
    const mapName = dataBuffer.getNullTerminatedString();

    const size = dataBuffer.getUint32();
    const tga = new Uint8Array(dataBuffer.getArray(size)).buffer;

    const author = dataBuffer.getNullTerminatedString();
    const description = dataBuffer.getNullTerminatedString();
    const players = dataBuffer.getNullTerminatedString();

    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_MAP_INFO,
      mapName,
      tga,
      author,
      description,
      players,
    };
  }
}
