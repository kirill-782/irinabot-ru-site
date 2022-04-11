import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  GLOBAL_CONTEXT_HEADER_CONSTANT,
  GLOBAL_GET_ERROR,
} from "./HeaderConstants";

export interface ServerError extends AbstractPackage {
  errorCode: number;
  description: string;
}

export class ServerErrorConverter extends AbstractConverter {
  public assembly(data: ServerError) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(GLOBAL_GET_ERROR);

    dataBuffer.putUint8(data.errorCode);
    dataBuffer.putNullTerminatedString(data.description);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ServerError {
    return {
      context: GLOBAL_CONTEXT_HEADER_CONSTANT,
      type: GLOBAL_GET_ERROR,
      errorCode: dataBuffer.getUint8(),
      description: dataBuffer.getNullTerminatedString(),
    };
  }
}
