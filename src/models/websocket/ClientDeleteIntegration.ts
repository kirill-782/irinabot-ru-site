import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  GLOBAL_CONTEXT_HEADER_CONSTANT,
  GLOBAL_DELETE_INTEGRATION,
} from "./HeaderConstants";

export interface ClientDeleteIntegration extends AbstractPackage {
  tokenType: number;
}

export class ClientDeleteIntegrationConverter extends AbstractConverter {
  public assembly(data: ClientDeleteIntegration) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(GLOBAL_DELETE_INTEGRATION);

    dataBuffer.putUint8(data.tokenType);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ClientDeleteIntegration {
    return {
      context: GLOBAL_CONTEXT_HEADER_CONSTANT,
      type: GLOBAL_DELETE_INTEGRATION,
      tokenType: dataBuffer.getUint8(),
    };
  }
}
