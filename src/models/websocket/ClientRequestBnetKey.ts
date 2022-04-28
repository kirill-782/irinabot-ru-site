import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  GLOBAL_CONTEXT_HEADER_CONSTANT,
  GLOBAL_REQUEST_BNET_KEY,
} from "./HeaderConstants";

export interface ClientRequestBnetKey extends AbstractPackage {}

export class ClientRequestBnetKeyConverter extends AbstractConverter {
  public assembly(data: ClientRequestBnetKey) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(GLOBAL_REQUEST_BNET_KEY);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ClientRequestBnetKey {
    return {
      context: GLOBAL_CONTEXT_HEADER_CONSTANT,
      type: GLOBAL_REQUEST_BNET_KEY,
    };
  }
}
