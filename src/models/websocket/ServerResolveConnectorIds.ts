import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_RESOLVE_CONNECTOR_IDS_RESPONSE,
} from "./HeaderConstants";

export interface ServerResolveConnectorIds extends AbstractPackage {
  connectorIds: {
    [key: number]: string;
  };
}

export class ServerResolveConnectorIdsConverter extends AbstractConverter {
  public assembly(data: ServerResolveConnectorIds) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(6));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_RESOLVE_CONNECTOR_IDS_RESPONSE);

    dataBuffer.putUint32(Object.keys(data.connectorIds).length);

    Object.entries(data.connectorIds).forEach((i) => {
      dataBuffer.putUint32(parseInt(i[0]));
      dataBuffer.putNullTerminatedString(i[1]);
    });

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ServerResolveConnectorIds {
    let connectorIds = {};

    const count = dataBuffer.getUint32();

    for (let i = 0; i < count; ++i) {
      const connectorId = dataBuffer.getUint32();
      connectorIds[connectorId] = dataBuffer.getNullTerminatedString();
    }

    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_RESOLVE_CONNECTOR_IDS_RESPONSE,
      connectorIds,
    };
  }
}
