import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_NEW_MESSAGE, DEFAULT_SEND_MESSAGE } from "./HeaderConstants";

export interface ClientTextMessage extends AbstractPackage {
    from: string;
    to: string;
    text: string;
}

export class ClientTextMessageConverter extends AbstractConverter {
    public assembly(data: ClientTextMessage) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_SEND_MESSAGE);
        dataBuffer.putNullTerminatedString(data.to);
        dataBuffer.putNullTerminatedString(data.from);
        dataBuffer.putNullTerminatedString(data.text);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ClientTextMessage {
        return {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_SEND_MESSAGE,
            to: dataBuffer.getNullTerminatedString(),
            from: dataBuffer.getNullTerminatedString(),
            text: dataBuffer.getNullTerminatedString(),
        };
    }
}
