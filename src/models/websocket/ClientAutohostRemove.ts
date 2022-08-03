import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  DEFAULT_AUTOHOST_LIST,
  DEFAULT_AUTOHOST_REMOVE,
  DEFAULT_CONTEXT_HEADER_CONSTANT,
} from "./HeaderConstants";

export interface ClientAutohostRemove extends AbstractPackage {
  autohostId: number;
}

export class ClientAutohostRemoveConverter extends AbstractConverter {
  public assembly(data: ClientAutohostRemove) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_AUTOHOST_REMOVE);
    dataBuffer.putUint32(data.autohostId);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ClientAutohostRemove {
    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_AUTOHOST_REMOVE,
      autohostId: dataBuffer.getUint32(),
    };
  }
}
