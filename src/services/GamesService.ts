import Axios, { AxiosRequestConfig } from "axios";
import { BotInfo } from "../models/rest/BotInfo";
import { CreateGameRequest } from "../models/rest/CreateGameRequest";
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
            headers: {
                Authorization:
                    "Bearer eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJJUklOQS1BUEktTUFQUyIsImF1dGhvcml0aWVzIjpbIk1BUF9SRUFEIiwiTUFQX1JFQURfR0xPQkFMIiwiTUFQX0ZJTFRFUiIsIk1BUF9DUkVBVEUiLCJERUZBVUxUX0NPTkZJR19QQVJTRSIsIkNPTkZJR19SRUFEIiwiQ09ORklHX0VESVQiLCJDT05GSUdfREVMRVRFIiwiQ09ORklHX0NSRUFURSIsIk1BUF9GTEFHU19SRUFEIiwiTUFQX0ZMQUdTX0VESVQiLCJNQVBfVkVSSUZZIiwiTUFQX0ZMQUdTX1JFQURfR0xPQkFMIiwiTUFQX0ZMQUdTX0VESVRfR0xPQkFMIiwiTUFQX0ZMQUdTX1JFQURfVElFUl8yIiwiTUFQX0ZMQUdTX1dSSVRFX1RJRVJfMiIsIk1BUF9GTEFHU19SRUFEX1RJRVJfMSIsIk1BUF9GTEFHU19XUklURV9USUVSXzEiLCJNQVBfU0hPUlRfVEFHIiwiQkVUQV9BQ0NFU1MiLCJET05BVEVfUE9TSVRJT05fVklQX0NPTU1BTkRTIiwiRE9OQVRFX1BPU0lUSU9OX0JBTl9BREQiLCJET05BVEVfUE9TSVRJT05fQURNSU5fQUREIiwiRE9OQVRFX1BPU0lUSU9OX1NMT1RTX1NFUlZFUiIsIkRPTkFURV9QT1NJVElPTl9BVVRPSE9TVF9NQU5HRSIsIkFETUlOX0FDQ0VTU19ST09UIl0sImRpc3BsYXllZF9uaWNrbmFtZSI6InxjZmZmZjAwZmZTfHJ8Y2ZmZjIwY2ZmYXxyfGNmZmU1MTlmZm58cnxjZmZkOTI2ZmZnfHJ8Y2ZmY2MzM2Zmb3xyfGNmZmJmM2ZmZm58cnxjZmZiMzRjZmZvfHJ8Y2ZmYTY1OWZmbXxyfGNmZjk5NjZmZml8cnxjZmY4ZDcyZmZ5fHJ8Y2ZmODA3ZmZmYXxyIHxjZmY4MDgwZmZLfHJ8Y2ZmOTk2NmNjb3xyfGNmZmIyNGQ5OWt8cnxjZmZjYjMzNjZvfHJ8Y2ZmZTUxYTMzbXxyfGNmZmZlMDAwMGl8Y2ZmZmYwMGZmIiwiZXhwIjoxODM3NzU1MDg4LCJpYXQiOjE3Mzc3NTE0ODgsImlzcyI6IklSSU5BLUdIT1NUIiwibmlja25hbWUiOiJLb2tvbWkpIiwibmlja25hbWVfcHJlZml4IjoifGNmZmZmMDBmZlN8cnxjZmZmMjBjZmZhfHJ8Y2ZmZTUxOWZmbnxyfGNmZmQ5MjZmZmd8cnxjZmZjYzMzZmZvfHJ8Y2ZmYmYzZmZmbnxyfGNmZmIzNGNmZm98cnxjZmZhNjU5ZmZtfHJ8Y2ZmOTk2NmZmaXxyfGNmZjhkNzJmZnl8cnxjZmY4MDdmZmZhfHIgfGNmZjgwODBmZkt8cnxjZmY5OTY2Y2NvfHJ8Y2ZmYjI0ZDk5a3xyfGNmZmNiMzM2Nm98cnxjZmZlNTFhMzNtfHJ8Y2ZmZmUwMDAwaXxjZmZmZjAwZmYiLCJzdWIiOiI4In0.5HMAoMP1Mlq5LT_vl8HgIFra5KSNJWlfm9jloMEDWlcpYuM8LQSRRkg6tsC28W5mppMkwSbFH2CahOtr0DVDgg",
            },
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

    createGame = async (body: CreateGameRequest) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/games/request",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Bearer eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJJUklOQS1BUEktTUFQUyIsImF1dGhvcml0aWVzIjpbIk1BUF9SRUFEIiwiTUFQX1JFQURfR0xPQkFMIiwiTUFQX0ZJTFRFUiIsIk1BUF9DUkVBVEUiLCJERUZBVUxUX0NPTkZJR19QQVJTRSIsIkNPTkZJR19SRUFEIiwiQ09ORklHX0VESVQiLCJDT05GSUdfREVMRVRFIiwiQ09ORklHX0NSRUFURSIsIk1BUF9GTEFHU19SRUFEIiwiTUFQX0ZMQUdTX0VESVQiLCJNQVBfVkVSSUZZIiwiTUFQX0ZMQUdTX1JFQURfR0xPQkFMIiwiTUFQX0ZMQUdTX0VESVRfR0xPQkFMIiwiTUFQX0ZMQUdTX1JFQURfVElFUl8yIiwiTUFQX0ZMQUdTX1dSSVRFX1RJRVJfMiIsIk1BUF9GTEFHU19SRUFEX1RJRVJfMSIsIk1BUF9GTEFHU19XUklURV9USUVSXzEiLCJNQVBfU0hPUlRfVEFHIiwiQkVUQV9BQ0NFU1MiLCJET05BVEVfUE9TSVRJT05fVklQX0NPTU1BTkRTIiwiRE9OQVRFX1BPU0lUSU9OX0JBTl9BREQiLCJET05BVEVfUE9TSVRJT05fQURNSU5fQUREIiwiRE9OQVRFX1BPU0lUSU9OX1NMT1RTX1NFUlZFUiIsIkRPTkFURV9QT1NJVElPTl9BVVRPSE9TVF9NQU5HRSIsIkFETUlOX0FDQ0VTU19ST09UIl0sImRpc3BsYXllZF9uaWNrbmFtZSI6InxjZmZmZjAwZmZTfHJ8Y2ZmZjIwY2ZmYXxyfGNmZmU1MTlmZm58cnxjZmZkOTI2ZmZnfHJ8Y2ZmY2MzM2Zmb3xyfGNmZmJmM2ZmZm58cnxjZmZiMzRjZmZvfHJ8Y2ZmYTY1OWZmbXxyfGNmZjk5NjZmZml8cnxjZmY4ZDcyZmZ5fHJ8Y2ZmODA3ZmZmYXxyIHxjZmY4MDgwZmZLfHJ8Y2ZmOTk2NmNjb3xyfGNmZmIyNGQ5OWt8cnxjZmZjYjMzNjZvfHJ8Y2ZmZTUxYTMzbXxyfGNmZmZlMDAwMGl8Y2ZmZmYwMGZmIiwiZXhwIjoxODM3NzU1MDg4LCJpYXQiOjE3Mzc3NTE0ODgsImlzcyI6IklSSU5BLUdIT1NUIiwibmlja25hbWUiOiJLb2tvbWkpIiwibmlja25hbWVfcHJlZml4IjoifGNmZmZmMDBmZlN8cnxjZmZmMjBjZmZhfHJ8Y2ZmZTUxOWZmbnxyfGNmZmQ5MjZmZmd8cnxjZmZjYzMzZmZvfHJ8Y2ZmYmYzZmZmbnxyfGNmZmIzNGNmZm98cnxjZmZhNjU5ZmZtfHJ8Y2ZmOTk2NmZmaXxyfGNmZjhkNzJmZnl8cnxjZmY4MDdmZmZhfHIgfGNmZjgwODBmZkt8cnxjZmY5OTY2Y2NvfHJ8Y2ZmYjI0ZDk5a3xyfGNmZmNiMzM2Nm98cnxjZmZlNTFhMzNtfHJ8Y2ZmZmUwMDAwaXxjZmZmZjAwZmYiLCJzdWIiOiI4In0.5HMAoMP1Mlq5LT_vl8HgIFra5KSNJWlfm9jloMEDWlcpYuM8LQSRRkg6tsC28W5mppMkwSbFH2CahOtr0DVDgg",
            },
            data: JSON.stringify(body),
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
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Bearer eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJJUklOQS1BUEktTUFQUyIsImF1dGhvcml0aWVzIjpbIk1BUF9SRUFEIiwiTUFQX1JFQURfR0xPQkFMIiwiTUFQX0ZJTFRFUiIsIk1BUF9DUkVBVEUiLCJERUZBVUxUX0NPTkZJR19QQVJTRSIsIkNPTkZJR19SRUFEIiwiQ09ORklHX0VESVQiLCJDT05GSUdfREVMRVRFIiwiQ09ORklHX0NSRUFURSIsIk1BUF9GTEFHU19SRUFEIiwiTUFQX0ZMQUdTX0VESVQiLCJNQVBfVkVSSUZZIiwiTUFQX0ZMQUdTX1JFQURfR0xPQkFMIiwiTUFQX0ZMQUdTX0VESVRfR0xPQkFMIiwiTUFQX0ZMQUdTX1JFQURfVElFUl8yIiwiTUFQX0ZMQUdTX1dSSVRFX1RJRVJfMiIsIk1BUF9GTEFHU19SRUFEX1RJRVJfMSIsIk1BUF9GTEFHU19XUklURV9USUVSXzEiLCJNQVBfU0hPUlRfVEFHIiwiQkVUQV9BQ0NFU1MiLCJET05BVEVfUE9TSVRJT05fVklQX0NPTU1BTkRTIiwiRE9OQVRFX1BPU0lUSU9OX0JBTl9BREQiLCJET05BVEVfUE9TSVRJT05fQURNSU5fQUREIiwiRE9OQVRFX1BPU0lUSU9OX1NMT1RTX1NFUlZFUiIsIkRPTkFURV9QT1NJVElPTl9BVVRPSE9TVF9NQU5HRSIsIkFETUlOX0FDQ0VTU19ST09UIl0sImRpc3BsYXllZF9uaWNrbmFtZSI6InxjZmZmZjAwZmZTfHJ8Y2ZmZjIwY2ZmYXxyfGNmZmU1MTlmZm58cnxjZmZkOTI2ZmZnfHJ8Y2ZmY2MzM2Zmb3xyfGNmZmJmM2ZmZm58cnxjZmZiMzRjZmZvfHJ8Y2ZmYTY1OWZmbXxyfGNmZjk5NjZmZml8cnxjZmY4ZDcyZmZ5fHJ8Y2ZmODA3ZmZmYXxyIHxjZmY4MDgwZmZLfHJ8Y2ZmOTk2NmNjb3xyfGNmZmIyNGQ5OWt8cnxjZmZjYjMzNjZvfHJ8Y2ZmZTUxYTMzbXxyfGNmZmZlMDAwMGl8Y2ZmZmYwMGZmIiwiZXhwIjoxODM3NzU1MDg4LCJpYXQiOjE3Mzc3NTE0ODgsImlzcyI6IklSSU5BLUdIT1NUIiwibmlja25hbWUiOiJLb2tvbWkpIiwibmlja25hbWVfcHJlZml4IjoifGNmZmZmMDBmZlN8cnxjZmZmMjBjZmZhfHJ8Y2ZmZTUxOWZmbnxyfGNmZmQ5MjZmZmd8cnxjZmZjYzMzZmZvfHJ8Y2ZmYmYzZmZmbnxyfGNmZmIzNGNmZm98cnxjZmZhNjU5ZmZtfHJ8Y2ZmOTk2NmZmaXxyfGNmZjhkNzJmZnl8cnxjZmY4MDdmZmZhfHIgfGNmZjgwODBmZkt8cnxjZmY5OTY2Y2NvfHJ8Y2ZmYjI0ZDk5a3xyfGNmZmNiMzM2Nm98cnxjZmZlNTFhMzNtfHJ8Y2ZmZmUwMDAwaXxjZmZmZjAwZmYiLCJzdWIiOiI4In0.5HMAoMP1Mlq5LT_vl8HgIFra5KSNJWlfm9jloMEDWlcpYuM8LQSRRkg6tsC28W5mppMkwSbFH2CahOtr0DVDgg",
            },
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
            headers: {
                Authorization:
                    "Bearer eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJJUklOQS1BUEktTUFQUyIsImF1dGhvcml0aWVzIjpbIk1BUF9SRUFEIiwiTUFQX1JFQURfR0xPQkFMIiwiTUFQX0ZJTFRFUiIsIk1BUF9DUkVBVEUiLCJERUZBVUxUX0NPTkZJR19QQVJTRSIsIkNPTkZJR19SRUFEIiwiQ09ORklHX0VESVQiLCJDT05GSUdfREVMRVRFIiwiQ09ORklHX0NSRUFURSIsIk1BUF9GTEFHU19SRUFEIiwiTUFQX0ZMQUdTX0VESVQiLCJNQVBfVkVSSUZZIiwiTUFQX0ZMQUdTX1JFQURfR0xPQkFMIiwiTUFQX0ZMQUdTX0VESVRfR0xPQkFMIiwiTUFQX0ZMQUdTX1JFQURfVElFUl8yIiwiTUFQX0ZMQUdTX1dSSVRFX1RJRVJfMiIsIk1BUF9GTEFHU19SRUFEX1RJRVJfMSIsIk1BUF9GTEFHU19XUklURV9USUVSXzEiLCJNQVBfU0hPUlRfVEFHIiwiQkVUQV9BQ0NFU1MiLCJET05BVEVfUE9TSVRJT05fVklQX0NPTU1BTkRTIiwiRE9OQVRFX1BPU0lUSU9OX0JBTl9BREQiLCJET05BVEVfUE9TSVRJT05fQURNSU5fQUREIiwiRE9OQVRFX1BPU0lUSU9OX1NMT1RTX1NFUlZFUiIsIkRPTkFURV9QT1NJVElPTl9BVVRPSE9TVF9NQU5HRSIsIkFETUlOX0FDQ0VTU19ST09UIl0sImRpc3BsYXllZF9uaWNrbmFtZSI6InxjZmZmZjAwZmZTfHJ8Y2ZmZjIwY2ZmYXxyfGNmZmU1MTlmZm58cnxjZmZkOTI2ZmZnfHJ8Y2ZmY2MzM2Zmb3xyfGNmZmJmM2ZmZm58cnxjZmZiMzRjZmZvfHJ8Y2ZmYTY1OWZmbXxyfGNmZjk5NjZmZml8cnxjZmY4ZDcyZmZ5fHJ8Y2ZmODA3ZmZmYXxyIHxjZmY4MDgwZmZLfHJ8Y2ZmOTk2NmNjb3xyfGNmZmIyNGQ5OWt8cnxjZmZjYjMzNjZvfHJ8Y2ZmZTUxYTMzbXxyfGNmZmZlMDAwMGl8Y2ZmZmYwMGZmIiwiZXhwIjoxODM3NzU1MDg4LCJpYXQiOjE3Mzc3NTE0ODgsImlzcyI6IklSSU5BLUdIT1NUIiwibmlja25hbWUiOiJLb2tvbWkpIiwibmlja25hbWVfcHJlZml4IjoifGNmZmZmMDBmZlN8cnxjZmZmMjBjZmZhfHJ8Y2ZmZTUxOWZmbnxyfGNmZmQ5MjZmZmd8cnxjZmZjYzMzZmZvfHJ8Y2ZmYmYzZmZmbnxyfGNmZmIzNGNmZm98cnxjZmZhNjU5ZmZtfHJ8Y2ZmOTk2NmZmaXxyfGNmZjhkNzJmZnl8cnxjZmY4MDdmZmZhfHIgfGNmZjgwODBmZkt8cnxjZmY5OTY2Y2NvfHJ8Y2ZmYjI0ZDk5a3xyfGNmZmNiMzM2Nm98cnxjZmZlNTFhMzNtfHJ8Y2ZmZmUwMDAwaXxjZmZmZjAwZmYiLCJzdWIiOiI4In0.5HMAoMP1Mlq5LT_vl8HgIFra5KSNJWlfm9jloMEDWlcpYuM8LQSRRkg6tsC28W5mppMkwSbFH2CahOtr0DVDgg",
            },
        };

        return (await Axios.request<void>(request)).data;
    };

    getActiveBots = async () => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/games/request/bots`,
            method: "GET",
            headers: {
                Authorization:
                    "Bearer eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJJUklOQS1BUEktTUFQUyIsImF1dGhvcml0aWVzIjpbIk1BUF9SRUFEIiwiTUFQX1JFQURfR0xPQkFMIiwiTUFQX0ZJTFRFUiIsIk1BUF9DUkVBVEUiLCJERUZBVUxUX0NPTkZJR19QQVJTRSIsIkNPTkZJR19SRUFEIiwiQ09ORklHX0VESVQiLCJDT05GSUdfREVMRVRFIiwiQ09ORklHX0NSRUFURSIsIk1BUF9GTEFHU19SRUFEIiwiTUFQX0ZMQUdTX0VESVQiLCJNQVBfVkVSSUZZIiwiTUFQX0ZMQUdTX1JFQURfR0xPQkFMIiwiTUFQX0ZMQUdTX0VESVRfR0xPQkFMIiwiTUFQX0ZMQUdTX1JFQURfVElFUl8yIiwiTUFQX0ZMQUdTX1dSSVRFX1RJRVJfMiIsIk1BUF9GTEFHU19SRUFEX1RJRVJfMSIsIk1BUF9GTEFHU19XUklURV9USUVSXzEiLCJNQVBfU0hPUlRfVEFHIiwiQkVUQV9BQ0NFU1MiLCJET05BVEVfUE9TSVRJT05fVklQX0NPTU1BTkRTIiwiRE9OQVRFX1BPU0lUSU9OX0JBTl9BREQiLCJET05BVEVfUE9TSVRJT05fQURNSU5fQUREIiwiRE9OQVRFX1BPU0lUSU9OX1NMT1RTX1NFUlZFUiIsIkRPTkFURV9QT1NJVElPTl9BVVRPSE9TVF9NQU5HRSIsIkFETUlOX0FDQ0VTU19ST09UIl0sImRpc3BsYXllZF9uaWNrbmFtZSI6InxjZmZmZjAwZmZTfHJ8Y2ZmZjIwY2ZmYXxyfGNmZmU1MTlmZm58cnxjZmZkOTI2ZmZnfHJ8Y2ZmY2MzM2Zmb3xyfGNmZmJmM2ZmZm58cnxjZmZiMzRjZmZvfHJ8Y2ZmYTY1OWZmbXxyfGNmZjk5NjZmZml8cnxjZmY4ZDcyZmZ5fHJ8Y2ZmODA3ZmZmYXxyIHxjZmY4MDgwZmZLfHJ8Y2ZmOTk2NmNjb3xyfGNmZmIyNGQ5OWt8cnxjZmZjYjMzNjZvfHJ8Y2ZmZTUxYTMzbXxyfGNmZmZlMDAwMGl8Y2ZmZmYwMGZmIiwiZXhwIjoxODM3NzU1MDg4LCJpYXQiOjE3Mzc3NTE0ODgsImlzcyI6IklSSU5BLUdIT1NUIiwibmlja25hbWUiOiJLb2tvbWkpIiwibmlja25hbWVfcHJlZml4IjoifGNmZmZmMDBmZlN8cnxjZmZmMjBjZmZhfHJ8Y2ZmZTUxOWZmbnxyfGNmZmQ5MjZmZmd8cnxjZmZjYzMzZmZvfHJ8Y2ZmYmYzZmZmbnxyfGNmZmIzNGNmZm98cnxjZmZhNjU5ZmZtfHJ8Y2ZmOTk2NmZmaXxyfGNmZjhkNzJmZnl8cnxjZmY4MDdmZmZhfHIgfGNmZjgwODBmZkt8cnxjZmY5OTY2Y2NvfHJ8Y2ZmYjI0ZDk5a3xyfGNmZmNiMzM2Nm98cnxjZmZlNTFhMzNtfHJ8Y2ZmZmUwMDAwaXxjZmZmZjAwZmYiLCJzdWIiOiI4In0.5HMAoMP1Mlq5LT_vl8HgIFra5KSNJWlfm9jloMEDWlcpYuM8LQSRRkg6tsC28W5mppMkwSbFH2CahOtr0DVDgg",
            },
        };

        return (await Axios.request<BotInfo[]>(request)).data;
    };
}
