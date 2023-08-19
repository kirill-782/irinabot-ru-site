import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_SEND_GAME_EXTERNAL_SIGNAL } from "./HeaderConstants";

export interface ClientExternalSignal extends AbstractPackage {
    gameId: number;
    signal: string;
}

export class ClientExternalSignalConverter extends AbstractConverter {
    public assembly(data: ClientExternalSignal) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_SEND_GAME_EXTERNAL_SIGNAL);

        dataBuffer.putUint32(data.gameId);
        dataBuffer.putNullTerminatedString(data.signal);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ClientExternalSignal {
        return {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_SEND_GAME_EXTERNAL_SIGNAL,
            gameId: dataBuffer.getUint32(),
            signal: dataBuffer.getNullTerminatedString(),
        };
    }
}
