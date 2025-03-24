import Axios, { AxiosRequestConfig } from "axios";
import { GameDataFull, GameDataShort } from "../models/rest/Game";

// Интерфейсы для параметров
export interface GetGamesParams {
    ownerBotId?: number;
    started?: boolean;
    mapId?: number;
    gameVersions?: string[];
}

export interface GetGameParams {
    gameId: number;
    password?: string;
}

export interface DeleteGameParams {
    gameId: number;
}

export class GamesService {
    private defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    getGames = async (params: GetGamesParams, { ...signal }: AxiosRequestConfig) => {
        const { ownerBotId, started, mapId, gameVersions } = params;

        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            ...signal,
            url: "/v1/games",
            method: "GET",
            params: {
                botId: ownerBotId,
                started,
                mapId,
                gameVersions: gameVersions?.join(","),
            },
            validateStatus: (status) => {
                return status === 200 || status === 201;
            },
        };

        return (await Axios.request<Array<GameDataShort>>(request)).data;
    };

    getGame = async ({ gameId, password }: GetGameParams) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/games/${gameId}`,
            method: "GET",
            validateStatus: (status) => {
                return status === 200 || status === 201;
            },
        };

        if (password) {
            request.headers["X-Lobby-Password"] = password;
        }

        return (await Axios.request<GameDataFull>(request)).data;
    };

    deleteGame = async ({ gameId }: DeleteGameParams) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/games/${gameId}`,
            method: "DELETE",
        };

        return (await Axios.request<void>(request)).data;
    };
}
