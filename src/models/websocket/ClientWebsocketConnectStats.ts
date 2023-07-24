import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_GET_WEBSOCKETCONNECTS_STATS } from "./HeaderConstants";

export interface ClientWebsocketConnectStats extends AbstractPackage {}

export class ClientWebsocketConnectStatsConverter extends AbstractConverter {
    public assembly(data: ClientWebsocketConnectStats) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_GET_WEBSOCKETCONNECTS_STATS);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ClientWebsocketConnectStats {
        return {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_GET_WEBSOCKETCONNECTS_STATS,
        };
    }
}
