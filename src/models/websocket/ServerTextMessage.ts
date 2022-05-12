import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_NEW_MESSAGE,
} from "./HeaderConstants";

export interface ServerTextMessage extends AbstractPackage {
  from: string;
  to: string;
  text: string;
}

export class ServerTextMessageConverter extends AbstractConverter {
  public assembly(data: ServerTextMessage) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_NEW_MESSAGE);
    dataBuffer.putNullTerminatedString(data.to);
    dataBuffer.putNullTerminatedString(data.from);
    dataBuffer.putNullTerminatedString(data.text);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ServerTextMessage {
    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_NEW_MESSAGE,
      to: dataBuffer.getNullTerminatedString(),
      from: dataBuffer.getNullTerminatedString(),
      text: dataBuffer.getNullTerminatedString(),
    };
  }
}
