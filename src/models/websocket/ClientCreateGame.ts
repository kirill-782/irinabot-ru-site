import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_CREATE_GAME,
} from "./HeaderConstants";

export interface ClientCreateGame extends AbstractPackage {
  privateGame: boolean;
  flags: number;
  slotPreset: string;
  gameName: string;
  mapData: string;
}

export class ClientCreateGameConverter extends AbstractConverter {
  public assembly(data: ClientCreateGame) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_CREATE_GAME);
    dataBuffer.putInt8(data.privateGame ? 1 : 0);
    dataBuffer.putUint16(data.flags);

    dataBuffer.putNullTerminatedString(data.slotPreset);
    dataBuffer.putNullTerminatedString(data.gameName);
    dataBuffer.putNullTerminatedString(data.mapData);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ClientCreateGame {
    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_CREATE_GAME,
      privateGame: dataBuffer.getUint8() > 0,
      flags: dataBuffer.getUint16(),
      slotPreset: dataBuffer.getNullTerminatedString(),
      gameName: dataBuffer.getNullTerminatedString(),
      mapData: dataBuffer.getNullTerminatedString(),
    };
  }
}
