import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  GLOBAL_ADD_INTEGRATION_RESPONSE,
  GLOBAL_CONTEXT_HEADER_CONSTANT,
} from "./HeaderConstants";

export interface ServerAddIntegrationResponse extends AbstractPackage {
  connectorId: number;
  discordId: string;
  vkId: number;
  realm: string;
  bnetName: string;
  connectorName: string;
  mainType: number;
}

export class ServerAddIntegrationResponseConverter extends AbstractConverter {
  public assembly(data: ServerAddIntegrationResponse) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(GLOBAL_ADD_INTEGRATION_RESPONSE);

    dataBuffer.putUint32(data.connectorId);
    dataBuffer.putNullTerminatedString(data.discordId);
    dataBuffer.putUint32(data.vkId);

    dataBuffer.putNullTerminatedString(data.realm);
    dataBuffer.putNullTerminatedString(data.bnetName);

    dataBuffer.putNullTerminatedString(data.connectorName);
    dataBuffer.putUint8(data.mainType);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ServerAddIntegrationResponse {
    return {
      context: GLOBAL_CONTEXT_HEADER_CONSTANT,
      type: GLOBAL_ADD_INTEGRATION_RESPONSE,
      connectorId: dataBuffer.getUint32(),
      discordId: dataBuffer.getNullTerminatedString(),
      vkId: dataBuffer.getUint32(),
      realm: dataBuffer.getNullTerminatedString(),
      bnetName: dataBuffer.getNullTerminatedString(),
      connectorName: dataBuffer.getNullTerminatedString(),
      mainType: dataBuffer.getUint8(),
    };
  }
}
