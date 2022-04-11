import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  GLOBAL_CONTEXT_HEADER_CONSTANT,
  GLOBAL_USERAUTH,
} from "./HeaderConstants";

export interface ClientUserAuth extends AbstractPackage {
  tokenType: number;
  force: boolean;
  token: string;
}

export class ClientUserAuthConverter extends AbstractConverter {
  public assembly(data: ClientUserAuth) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(GLOBAL_USERAUTH);

    dataBuffer.putUint8(data.tokenType);
    dataBuffer.putUint8(data.force ? 1 : 0);
    dataBuffer.putNullTerminatedString(data.token);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ClientUserAuth {
    return {
      context: GLOBAL_CONTEXT_HEADER_CONSTANT,
      type: GLOBAL_USERAUTH,
      tokenType: dataBuffer.getUint8(),
      force: dataBuffer.getUint8() > 0,
      token: dataBuffer.getNullTerminatedString(),
    };
  }
}
