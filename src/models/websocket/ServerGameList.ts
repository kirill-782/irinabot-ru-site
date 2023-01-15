import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_GAME_LIST,
} from "./HeaderConstants";

export interface ServerGameList extends AbstractPackage {
  games: Array<GameListGame>;
}

export class GameListGameFlags {
  public started: boolean;
  public hasPassword: boolean;
  public hasOtherGame: boolean;
  public hasGamePowerUp: boolean;

  constructor(flags: number) {
    this.started = (flags & 1) > 0;
    this.hasPassword = (flags & 2) > 0;
    this.hasGamePowerUp = (flags & 4) > 0;
    this.hasOtherGame = (flags & 8) > 0;
  }

  public toInteger = () => {
    let number = 0;

    if (this.started) number |= 1;
    if (this.hasPassword) number |= 2;
    if (this.hasGamePowerUp) number |= 4;
    if (this.hasOtherGame) number |= 8;

    return number;
  };
}

export interface GameListGame {
  name: string;
  gameFlags: GameListGameFlags;
  mapId: number;
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

    dataBuffer.putNullTerminatedString(data.name);
    dataBuffer.putUint16(data.gameFlags.toInteger());
    dataBuffer.putUint32(data.mapId);
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
    let name = dataBuffer.getNullTerminatedString();
    const gameFlags = new GameListGameFlags(dataBuffer.getUint16());
    const mapId = dataBuffer.getUint32();

    let gamePosition = dataBuffer.getUint8();

    // Todo

    if(gamePosition > 2)
      gamePosition = 0;

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
      name,
      gameFlags,
      mapId,
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
