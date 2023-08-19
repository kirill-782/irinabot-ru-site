import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { GLOBAL_BNET_KEY, GLOBAL_CONTEXT_HEADER_CONSTANT } from "./HeaderConstants";

export interface ServerBnetKey extends AbstractPackage {
    key: string;
}

export class ServerBnetKeyConverter extends AbstractConverter {
    public assembly(data: ServerBnetKey) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(GLOBAL_BNET_KEY);
        dataBuffer.putNullTerminatedString(data.key);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ServerBnetKey {
        return {
            context: GLOBAL_CONTEXT_HEADER_CONSTANT,
            type: GLOBAL_BNET_KEY,
            key: dataBuffer.getNullTerminatedString(),
        };
    }
}
