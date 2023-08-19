import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_CREATE_GAME_RESPONSE } from "./HeaderConstants";

export interface ServerCreateGame extends AbstractPackage {
    status: number;
    description: string;
    password: string;
}

export class ServerCreateGameConverter extends AbstractConverter {
    public assembly(data: ServerCreateGame) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_CREATE_GAME_RESPONSE);
        dataBuffer.putInt8(data.status);

        dataBuffer.putNullTerminatedString(data.description);
        dataBuffer.putNullTerminatedString(data.password);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ServerCreateGame {
        return {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_CREATE_GAME_RESPONSE,
            status: dataBuffer.getUint8(),
            description: dataBuffer.getNullTerminatedString(),
            password: dataBuffer.getNullTerminatedString(),
        };
    }
}
