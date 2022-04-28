import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  GLOBAL_CONTEXT_HEADER_CONSTANT,
  GLOBAL_SET_CONNECTOR_NAME,
} from "./HeaderConstants";

export interface ClientSetConnectorName extends AbstractPackage {
  connectorName: string;
}

export class ClientSetConnectorNameConverter extends AbstractConverter {
  public assembly(data: ClientSetConnectorName) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(GLOBAL_SET_CONNECTOR_NAME);

    dataBuffer.putNullTerminatedString(data.connectorName);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ClientSetConnectorName {
    return {
      context: GLOBAL_CONTEXT_HEADER_CONSTANT,
      type: GLOBAL_SET_CONNECTOR_NAME,
      connectorName: dataBuffer.getNullTerminatedString(),
    };
  }
}
