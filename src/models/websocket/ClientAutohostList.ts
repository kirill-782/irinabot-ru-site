import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { DEFAULT_AUTOHOST_LIST, DEFAULT_CONTEXT_HEADER_CONSTANT } from "./HeaderConstants";

export interface ClientAutohostList extends AbstractPackage {}

export class ClientAutohostListConverter extends AbstractConverter {
    public assembly(data: ClientAutohostList) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_AUTOHOST_LIST);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ClientAutohostList {
        return {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_AUTOHOST_LIST,
        };
    }
}
