import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  DEFAULT_AUTOHOST_REMOVE,
  DEFAULT_AUTOHOST_REMOVE_RESPONSE,
  DEFAULT_CONTEXT_HEADER_CONSTANT,
} from "./HeaderConstants";

export interface ServerAutohostRemoveResponse extends AbstractPackage {
  status: number;
}

export class ServerAutohostRemoveResponseConverter extends AbstractConverter {
  public assembly(data: ServerAutohostRemoveResponse) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_AUTOHOST_REMOVE_RESPONSE);
    dataBuffer.putUint32(data.status);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ServerAutohostRemoveResponse {
    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_AUTOHOST_REMOVE_RESPONSE,
      status: dataBuffer.getUint32(),
    };
  }
}
