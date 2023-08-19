import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { DEFAULT_AUTOHOST_ADD_RESPONSE, DEFAULT_CONTEXT_HEADER_CONSTANT } from "./HeaderConstants";

export interface ServerAutohostAddResponse extends AbstractPackage {
    status: number;
    description: string;
    autohostId: number;
}

export class ServerAutohostAddResponseConverter extends AbstractConverter {
    public assembly(data: ServerAutohostAddResponse) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_AUTOHOST_ADD_RESPONSE);

        dataBuffer.putUint8(data.status);
        dataBuffer.putNullTerminatedString(data.description);
        dataBuffer.putUint32(data.autohostId);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ServerAutohostAddResponse {
        return {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_AUTOHOST_ADD_RESPONSE,
            status: dataBuffer.getUint8(),
            description: dataBuffer.getNullTerminatedString(),
            autohostId: dataBuffer.getUint32(),
        };
    }
}
