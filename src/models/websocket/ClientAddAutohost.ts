import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  DEFAULT_AUTOHOST_ADD,
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_CREATE_GAME,
} from "./HeaderConstants";

export interface ClientAddAutohost extends AbstractPackage {
  gameLimit: number;
  autostart: number;
  flags: number;
  name: string;
  slotPreset: string;
  hcl: string;
  mapData: string;
}

export class ClientAddAutohostConverter extends AbstractConverter {
  public assembly(data: ClientAddAutohost) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_AUTOHOST_ADD);

    dataBuffer.putUint16(data.gameLimit);
    dataBuffer.putUint16(data.autostart);
    dataBuffer.putUint16(data.flags);

    dataBuffer.putNullTerminatedString(data.name);
    dataBuffer.putNullTerminatedString(data.slotPreset);
    dataBuffer.putNullTerminatedString(data.hcl);
    dataBuffer.putNullTerminatedString(data.mapData);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ClientAddAutohost {
    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_AUTOHOST_ADD,
      gameLimit: dataBuffer.getUint16(),
      autostart: dataBuffer.getUint16(),
      flags: dataBuffer.getUint16(),
      name: dataBuffer.getNullTerminatedString(),
      slotPreset: dataBuffer.getNullTerminatedString(),
      hcl: dataBuffer.getNullTerminatedString(),
      mapData: dataBuffer.getNullTerminatedString(),
    };
  }
}
