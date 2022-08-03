import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_GET_GAMELIST,
  DEFAULT_RESOLVE_CONNECTOR_IDS,
} from "./HeaderConstants";

export interface ClientResolveConnectorIds extends AbstractPackage {
  connectorIds: number[];
}

export class ClientResolveConnectorIdsConverter extends AbstractConverter {
  public assembly(data: ClientResolveConnectorIds) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(6));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_RESOLVE_CONNECTOR_IDS);

    dataBuffer.putUint16(data.connectorIds.length);

    data.connectorIds.forEach((i) => {
      dataBuffer.putUint32(i);
    });

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ClientResolveConnectorIds {
    let connectorIds: number[] = [];

    const count = dataBuffer.getUint16();

    for (let i = 0; i < count; ++i)
      connectorIds[connectorIds.length] = dataBuffer.getUint32();

    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_RESOLVE_CONNECTOR_IDS,
      connectorIds,
    };
  }
}
