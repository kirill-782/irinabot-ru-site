import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_GET_WEBSOCKETCONNECTS_STATS } from "./HeaderConstants";

export interface ServerWebsocketConnectStats extends AbstractPackage {
    logined: number;
    connected: number;
}

export class ServerWebsocketConnectStatsConverter extends AbstractConverter {
    public assembly(data: ServerWebsocketConnectStats) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_GET_WEBSOCKETCONNECTS_STATS);

        dataBuffer.putUint32(data.logined);
        dataBuffer.putUint32(data.connected);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ServerWebsocketConnectStats {
        return {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_GET_WEBSOCKETCONNECTS_STATS,
            logined: dataBuffer.getUint32(),
            connected: dataBuffer.getUint32(),
        };
    }
}
