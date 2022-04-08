import { DataBuffer } from "../../utils/DataBuffer"

export interface AbstractPackage
{
    context?: number
    type?: number
}

export abstract class AbstractConverter
{
    public abstract assembly(data: AbstractPackage)

    public abstract parse(dataBuffer: DataBuffer) : AbstractPackage
}