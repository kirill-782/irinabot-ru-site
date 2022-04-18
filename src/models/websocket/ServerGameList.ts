import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_GAME_LIST,
} from "./HeaderConstants";

export interface ServerGameList extends AbstractPackage {
  games: Array<GameListGame>;
}

export interface GameListGame {
  started: boolean;
  name: string;
  mapName: string;
  mapFileName: string;
  hasPassword: boolean;
  hasOtherGame: boolean;
  hasGamePowerUp: boolean;
  gamePosition: number;
  gameCounter: number;
  gameTicks: number;
  creatorID: number;
  iccupHost: string;
  maxPlayers: number;
  orderID: number;
  players: Array<GameListPlayer>;
}

export interface GameListPlayer {
  colour: number;
  name: string;
  realm: string;
  comment: string;
}

export class ServerGameListConverter extends AbstractConverter {
  public assembly(data: ServerGameList) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
    dataBuffer.putUint8(DEFAULT_GAME_LIST);
    dataBuffer.putUint16(data.games.length);

    let gameListGameConverter = new GameListGameConverter();

    data.games.forEach(
      (element) =>
        dataBuffer.putByteArray(
          new Uint8Array(gameListGameConverter.assembly(element))
        ),
      this
    );

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ServerGameList {
    const countGames = dataBuffer.getUint16();

    let games: Array<GameListGame> = [];

    let gameListGameConverter = new GameListGameConverter();

    for (let i = 0; i < countGames; ++i)
      games[games.length] = gameListGameConverter.parse(dataBuffer);

    return {
      context: DEFAULT_CONTEXT_HEADER_CONSTANT,
      type: DEFAULT_GAME_LIST,
      games,
    };
  }
}

class GameListGameConverter {
  public assembly(data: GameListGame) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(2));

    dataBuffer.putUint8(data.started ? 1 : 0);
    dataBuffer.putNullTerminatedString(data.name);
    dataBuffer.putNullTerminatedString(data.mapName);
    dataBuffer.putNullTerminatedString(data.mapFileName);
    dataBuffer.putUint8(data.hasPassword ? 1 : 0);
    dataBuffer.putUint8(data.hasOtherGame ? 1 : 0);
    dataBuffer.putUint8(data.hasGamePowerUp ? 1 : 0);
    dataBuffer.putUint8(data.gamePosition);
    dataBuffer.putUint32(data.gameCounter);
    dataBuffer.putUint32(data.gameTicks);
    dataBuffer.putUint32(data.creatorID);
    dataBuffer.putNullTerminatedString(data.iccupHost);

    dataBuffer.putUint8(data.maxPlayers);
    dataBuffer.putUint32(data.orderID);

    dataBuffer.putUint8(data.players.length);

    let gameListPlayerConverter = new GameListPlayerConverter();

    data.players.forEach(
      (element) =>
        dataBuffer.putByteArray(
          new Uint8Array(gameListPlayerConverter.assembly(element))
        ),
      this
    );

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): GameListGame {
    const started = dataBuffer.getUint8() > 0;
    const name = dataBuffer.getNullTerminatedString();
    const mapName = dataBuffer.getNullTerminatedString(); // MapName
    const mapFileName = dataBuffer.getNullTerminatedString(); // MapFilename
    const hasPassword = dataBuffer.getUint8() > 0;
    const hasOtherGame = dataBuffer.getUint8() > 0;
    const hasGamePowerUp = dataBuffer.getUint8() > 0;
    const gamePosition = dataBuffer.getUint8();
    const gameCounter = dataBuffer.getUint32();
    const gameTicks = dataBuffer.getUint32();
    const creatorID = dataBuffer.getUint32();
    const iccupHost = dataBuffer.getNullTerminatedString();

    const maxPlayers = dataBuffer.getUint8();
    const orderID = dataBuffer.getUint32();

    const countPlayers = dataBuffer.getUint8();

    let players: Array<GameListPlayer> = [];

    let gameListPlayerConverter = new GameListPlayerConverter();

    for (let i = 0; i < countPlayers; ++i)
      players[players.length] = gameListPlayerConverter.parse(dataBuffer);

    return {
      started,
      name,
      mapName,
      mapFileName,
      hasPassword,
      hasOtherGame,
      hasGamePowerUp,
      gamePosition,
      gameCounter,
      gameTicks,
      creatorID,
      iccupHost,
      maxPlayers,
      orderID,
      players,
    };
  }
}

class GameListPlayerConverter {
  public assembly(data: GameListPlayer) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(4));

    dataBuffer.putUint8(data.colour);
    dataBuffer.putNullTerminatedString(data.name);
    dataBuffer.putNullTerminatedString(data.realm);
    dataBuffer.putNullTerminatedString(data.comment);

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): GameListPlayer {
    return {
      colour: dataBuffer.getUint8(),
      name: dataBuffer.getNullTerminatedString(),
      realm: dataBuffer.getNullTerminatedString(),
      comment: dataBuffer.getNullTerminatedString(),
    };
  }
}
