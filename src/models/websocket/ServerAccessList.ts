import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { GLOBAL_ACCESS_LIST, GLOBAL_API_TOKEN, GLOBAL_CONTEXT_HEADER_CONSTANT } from "./HeaderConstants";

export interface ServerAccessList extends AbstractPackage {
    records: AccessListRecord[];
}

export interface AccessListRecord {
    spaceId: number;
    accessMask: number;
    expireTime: number;
}

export class ServerAccessListConverter extends AbstractConverter {
    public assembly(data: ServerAccessList) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(GLOBAL_ACCESS_LIST);
        dataBuffer.putUint32(data.records.length);

        const subConverter = new AccessListRecordConverter();

        data.records.forEach((i) => {
            dataBuffer.putByteArray(new Uint8Array(subConverter.assembly(i)));
        });

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ServerAccessList {
        let records = [];
        const count = dataBuffer.getUint32();

        const subConverter = new AccessListRecordConverter();

        for (let i = 0; i < count; ++i) {
            records.push(subConverter.parse(dataBuffer));
        }

        return {
            context: GLOBAL_CONTEXT_HEADER_CONSTANT,
            type: GLOBAL_ACCESS_LIST,
            records,
        };
    }
}

class AccessListRecordConverter {
    public assembly(data: AccessListRecord) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(12));

        dataBuffer.putUint32(data.spaceId);
        dataBuffer.putUint32(data.accessMask);
        dataBuffer.putUint32(data.expireTime);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): AccessListRecord {
        return {
            spaceId: dataBuffer.getUint32(),
            accessMask: dataBuffer.getUint32(),
            expireTime: dataBuffer.getUint32(),
        };
    }
}
