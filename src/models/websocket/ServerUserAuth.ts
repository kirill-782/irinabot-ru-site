import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { GLOBAL_CONTEXT_HEADER_CONSTANT, GLOBAL_USER_AUTH_RESPONSE } from "./HeaderConstants";

export interface ServerUserAuth extends AbstractPackage {
    id: string;
    nickname: string;
    avatar_URL: string;

    connectorId: number;
    discordId: string;
    vkId: number;
    googleId: string;
    telegramId: string;
    yandexId: string;

    realm: string;
    bnetName: string;
    connectorName: string;
    mainType: number;
    nicknamePrefix: string;
}

export class ServerUserAuthConverter extends AbstractConverter {
    public assembly(data: ServerUserAuth) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(GLOBAL_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(GLOBAL_USER_AUTH_RESPONSE);

        dataBuffer.putNullTerminatedString(data.id);
        dataBuffer.putNullTerminatedString(data.nickname);
        dataBuffer.putNullTerminatedString(data.avatar_URL);

        dataBuffer.putUint32(data.connectorId);
        dataBuffer.putNullTerminatedString(data.discordId);
        dataBuffer.putUint32(data.vkId);
        dataBuffer.putNullTerminatedString(data.googleId);
        dataBuffer.putNullTerminatedString(data.telegramId);
        dataBuffer.putNullTerminatedString(data.yandexId);

        dataBuffer.putNullTerminatedString(data.realm);
        dataBuffer.putNullTerminatedString(data.bnetName);

        dataBuffer.putNullTerminatedString(data.connectorName);
        dataBuffer.putUint8(data.mainType);
        dataBuffer.putNullTerminatedString(data.nicknamePrefix);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ServerUserAuth {
        return {
            context: GLOBAL_CONTEXT_HEADER_CONSTANT,
            type: GLOBAL_USER_AUTH_RESPONSE,
            id: dataBuffer.getNullTerminatedString(),
            nickname: dataBuffer.getNullTerminatedString(),
            avatar_URL: dataBuffer.getNullTerminatedString(),

            connectorId: dataBuffer.getUint32(),
            discordId: dataBuffer.getNullTerminatedString(),
            vkId: dataBuffer.getUint32(),
            googleId: dataBuffer.getNullTerminatedString(),
            telegramId: dataBuffer.getNullTerminatedString(),
            yandexId: dataBuffer.getNullTerminatedString(),
            realm: dataBuffer.getNullTerminatedString(),
            bnetName: dataBuffer.getNullTerminatedString(),
            connectorName: dataBuffer.getNullTerminatedString(),
            mainType: dataBuffer.getUint8(),
            nicknamePrefix: dataBuffer.getNullTerminatedString(),
        };
    }
}
