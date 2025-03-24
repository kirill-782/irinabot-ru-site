import { BotInfo } from "./BotInfo";

interface GameBasic {
    id: number;
    hostHash?: number;
    token?: number;
    passwordRequired?: boolean;
}

interface GameBase extends GameBasic {
    name: string;
    mapId: number;
    ownerBot: BotInfo;
    creatorUserId: string;
    gameVersion: string;
    externalAccount: string;
    started: boolean;
    slots: GameSlot[];
    gameTicks: number;
    createdAt: number;
    updatedAt: number;
    startedAt: number;
    localId: string;
    isAutohost: boolean;
}

interface GameExtended extends GameBasic {
    mapGameType: number;
    mapGameFlags: string;
    mapPath: string;
    mapWidth: string;
    mapHeight: string;
    mapCrc: string;
    mapFileSha1: string;
    mapSha1: string;
    highlighted: boolean;
    bucket: number;
    domain: string;
    entryKey: number;
    versionPrefix: string;
    broadcast: boolean;
    maxPlayers: number;
    productId: string;
    hostCounter: number;
    hostName: string;
    connectPort: number;
    connectHost: string;
}

export type GameDataShort = Omit<GameBase, "hostHash" | "passwordRequired"> & {
    hostHash: number;
    passwordRequired: boolean;
};

export type GameDataFull = GameBase &
    GameExtended &
    Omit<GameBase, "token"> & {
        token: string;
    };

export interface GameSlot {
    color: number;
    status: number;
    player: GamePlayer | null;
}

export interface GamePlayer {
    id: number;
    name: string;
    realm: string;
}
