import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { GLOBAL_CONTEXT_HEADER_CONSTANT, GLOBAL_NICKNAME_CHANGE_COLOR } from "./HeaderConstants";

export interface ClientNickanameColorChange extends AbstractPackage {
    color: number;
}

export class ClientNickanameColorChangeConverter extends AbstractConverter {
    public assembly(data: ClientNickanameColorChange) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(6));

        dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(GLOBAL_NICKNAME_CHANGE_COLOR);
        dataBuffer.putUint32(data.color);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ClientNickanameColorChange {
        return {
            context: GLOBAL_CONTEXT_HEADER_CONSTANT,
            type: GLOBAL_NICKNAME_CHANGE_COLOR,
            color: dataBuffer.getUint32(),
        };
    }
}
