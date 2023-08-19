import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractPackage, AbstractConverter } from "./AbstractPackage";
import { CONNECTOR_ADD_GAME } from "./HeaderConstants";

export interface ConnectorBrowserAddGame extends AbstractPackage {
    data: number[];
}

export class ConnectorBrowserAddGameConverter extends AbstractConverter {
    public assembly(data: ConnectorBrowserAddGame) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(1));

        dataBuffer.putUint8(CONNECTOR_ADD_GAME);
        dataBuffer.putByteArray(data.data);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ConnectorBrowserAddGame {
        const dataSize = dataBuffer.length() - dataBuffer.getPosition();

        return {
            type: CONNECTOR_ADD_GAME,
            data: dataBuffer.getArray(dataSize),
        };
    }
}
