import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractPackage, AbstractConverter } from "./AbstractPackage";
import { CONNECTOR_UDP_BROADCAST } from "./HeaderConstants";

export interface ConnectorBrowserRemoveGame extends AbstractPackage {
  gameId: number;
}

export class ConnectorBrowserRemoveGameConverter extends AbstractConverter {
  public assembly(data: ConnectorBrowserRemoveGame) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(9));

    dataBuffer.putUint8(CONNECTOR_UDP_BROADCAST);

    dataBuffer.putUint8(247);
    dataBuffer.putUint8(51);
    dataBuffer.putUint8(8);
    dataBuffer.putUint8(0);

    dataBuffer.putUint32(data.gameId);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ConnectorBrowserRemoveGame {
    dataBuffer.getUint32(); // Skip WC3Header

    return {
      type: CONNECTOR_UDP_BROADCAST,
      gameId: dataBuffer.getUint32(),
    };
  }
}
