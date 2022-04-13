import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractPackage, AbstractConverter } from "./AbstractPackage";
import { CONNECTOR_HELLO } from "./HeaderConstants";

export interface ConnectorHello extends AbstractPackage {
  version: number;
}

export class ConnectorHelloConverter extends AbstractConverter {
  public assembly(data: ConnectorHello) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(5));

    dataBuffer.putUint8(CONNECTOR_HELLO);
    dataBuffer.putUint32(data.version);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ConnectorHello {
    return {
      type: CONNECTOR_HELLO,
      version: dataBuffer.getUint32(),
    };
  }
}
