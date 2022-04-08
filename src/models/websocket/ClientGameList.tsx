import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_GET_GAMELIST } from "./HeaderConstants";


export interface ClientGameList extends AbstractPackage
{
    filters: number
}

export class ClientGameListConverter extends AbstractConverter {

    public assembly(data: ClientGameList)
    {
        const dataBuffer = new DataBuffer(new ArrayBuffer(6));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_GET_GAMELIST);

        dataBuffer.putUint32(data.filters);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer) : ClientGameList
    {
        return {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_GET_GAMELIST,
            filters: dataBuffer.getUint32()
        }
    }
}