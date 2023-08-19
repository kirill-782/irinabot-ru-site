import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractPackage, AbstractConverter } from "./AbstractPackage";
import { CONNECTOR_RESET_GAMES } from "./HeaderConstants";

export interface ConnectorBrowserResetGames extends AbstractPackage {}

export class ConnectorBrowserResetConverter extends AbstractConverter {
    public assembly(data: ConnectorBrowserResetGames) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(1));

        dataBuffer.putUint8(CONNECTOR_RESET_GAMES);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ConnectorBrowserResetGames {
        return {
            type: CONNECTOR_RESET_GAMES,
        };
    }
}
