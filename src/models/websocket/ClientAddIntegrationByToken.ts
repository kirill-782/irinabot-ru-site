import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { GLOBAL_ADD_INTEGRATION_BY_TOKEN, GLOBAL_CONTEXT_HEADER_CONSTANT } from "./HeaderConstants";

export interface ClientAddIntegrationByToken extends AbstractPackage {
    tokenType: number;
    token: string;
}

export class ClientAddIntegrationByTokenConverter extends AbstractConverter {
    public assembly(data: ClientAddIntegrationByToken) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(GLOBAL_ADD_INTEGRATION_BY_TOKEN);

        dataBuffer.putUint8(data.tokenType);
        dataBuffer.putNullTerminatedString(data.token);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ClientAddIntegrationByToken {
        return {
            context: GLOBAL_CONTEXT_HEADER_CONSTANT,
            type: GLOBAL_ADD_INTEGRATION_BY_TOKEN,
            tokenType: dataBuffer.getUint8(),
            token: dataBuffer.getNullTerminatedString(),
        };
    }
}
