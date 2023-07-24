import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractPackage, AbstractConverter } from "./AbstractPackage";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_UDP_ANSWER } from "./HeaderConstants";

interface ServerUDPAnswerBase extends AbstractPackage {
    token: string;
    hostCounter: number;
    entryKey: number;
    connectPort: number;
    connectHost: string;

    gameName: string;
    mapGameFlags: number[];
    mapWidth: number[];
    mapHeight: number[];
    mapCrc: number[];
    mapPath: string;
    hostName: string;
    mapFileSha1: number[];
    version: string;
    maxPlayers: number;
    mapGameType: number;
}

interface ServerUDPAnswerBroadcastExtension {
    broadcast: true;
    productId: number[];
    versionPrefix: number[];
}

interface ServerUDPAnswerDomainExtension {
    broadcast: false;
    domain: string;
}

export type ServerUDPAnswer = ServerUDPAnswerBase &
    (ServerUDPAnswerDomainExtension | ServerUDPAnswerBroadcastExtension);

export class ServerUDPAnswerConverter extends AbstractConverter {
    public assembly(data: ServerUDPAnswer) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_UDP_ANSWER);
        dataBuffer.putNullTerminatedString(data.token);
        dataBuffer.putUint32(data.hostCounter);
        dataBuffer.putUint32(data.entryKey);
        dataBuffer.putUint16(data.connectPort);
        dataBuffer.putNullTerminatedString(data.connectHost);

        dataBuffer.putNullTerminatedString(data.gameName);
        dataBuffer.putByteArray(data.mapGameFlags);
        dataBuffer.putByteArray(data.mapWidth);
        dataBuffer.putByteArray(data.mapHeight);
        dataBuffer.putByteArray(data.mapCrc);
        dataBuffer.putNullTerminatedString(data.mapPath);
        dataBuffer.putNullTerminatedString(data.hostName);
        dataBuffer.putByteArray(data.mapFileSha1);

        dataBuffer.putNullTerminatedString(data.version);
        dataBuffer.putUint32(data.maxPlayers);

        if (data.broadcast) {
            dataBuffer.putUint8(1);
            dataBuffer.putByteArray(data.productId);
            dataBuffer.putByteArray(data.versionPrefix);
        } else {
            dataBuffer.putUint8(0);
            dataBuffer.putNullTerminatedString((data as ServerUDPAnswerDomainExtension).domain);
        }

        dataBuffer.putUint32(data.mapGameType);

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ServerUDPAnswer {
        const baseData: ServerUDPAnswerBase = {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_UDP_ANSWER,
            token: dataBuffer.getNullTerminatedString(),
            hostCounter: dataBuffer.getUint32(),
            entryKey: dataBuffer.getUint32(),
            connectPort: dataBuffer.getUint16(),
            connectHost: dataBuffer.getNullTerminatedString(),
            gameName: dataBuffer.getNullTerminatedString(),
            mapGameFlags: dataBuffer.getArray(4),
            mapWidth: dataBuffer.getArray(2),
            mapHeight: dataBuffer.getArray(2),
            mapCrc: dataBuffer.getArray(4),
            mapPath: dataBuffer.getNullTerminatedString(),
            hostName: dataBuffer.getNullTerminatedString(),
            mapFileSha1: dataBuffer.getArray(20),
            version: dataBuffer.getNullTerminatedString(),
            maxPlayers: dataBuffer.getUint32(),
            mapGameType: 0,
        };

        if (dataBuffer.getUint8()) {
            return {
                ...baseData,
                broadcast: true,
                productId: dataBuffer.getArray(4),
                versionPrefix: dataBuffer.getArray(4),
                mapGameType: dataBuffer.getUint32(),
            };
        }

        return {
            ...baseData,
            broadcast: false,
            domain: dataBuffer.getNullTerminatedString(),
            mapGameType: dataBuffer.getUint32(),
        };
    }
}
