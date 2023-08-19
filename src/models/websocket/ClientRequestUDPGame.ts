import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractPackage, AbstractConverter } from "./AbstractPackage";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_GET_UDP_GAME } from "./HeaderConstants";

export interface ClientRequestUDPGame extends AbstractPackage {
    isPrivateKey: boolean;
    gameId: number;
    password: string;
}

export class ClientRequestUDPGameConverter extends AbstractConverter {
    public assembly(data: ClientRequestUDPGame) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_GET_UDP_GAME);

        dataBuffer.putUint8(data.isPrivateKey ? 1 : 0);
        dataBuffer.putUint32(data.gameId);
        dataBuffer.putNullTerminatedString(data.password);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ClientRequestUDPGame {
        return {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_GET_UDP_GAME,
            isPrivateKey: dataBuffer.getUint8() > 0,
            gameId: dataBuffer.getUint32(),
            password: dataBuffer.getNullTerminatedString(),
        };
    }
}
