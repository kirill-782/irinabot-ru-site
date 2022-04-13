import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractPackage, AbstractConverter } from "./AbstractPackage";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_MAP_INFO,
  DEFAULT_UDP_ANSWER,
} from "./HeaderConstants";

export interface ServerUDPAnswer extends AbstractPackage {
  data: number[];
}

export class ServerUDPAnswerConverter extends AbstractConverter {
  public assembly(data: ServerUDPAnswer) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_UDP_ANSWER);

    dataBuffer.putByteArray(data.data);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ServerUDPAnswer {
    const dataSize = dataBuffer.length() - dataBuffer.getPosition();

    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_UDP_ANSWER,
      data: dataBuffer.getArray(dataSize),
    };
  }
}
