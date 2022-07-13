import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { GLOBAL_API_TOKEN, GLOBAL_CONTEXT_HEADER_CONSTANT } from "./HeaderConstants";


export interface ServerApiToken extends AbstractPackage {
  token: string;
}

export class ServerApiTokenConverter extends AbstractConverter {
  public assembly(data: ServerApiToken) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(GLOBAL_API_TOKEN);
    dataBuffer.putNullTerminatedString(data.token);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ServerApiToken {
    return {
      context: GLOBAL_CONTEXT_HEADER_CONSTANT,
      type: GLOBAL_API_TOKEN,
      token: dataBuffer.getNullTerminatedString(),
    };
  }
}