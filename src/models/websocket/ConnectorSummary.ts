import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractPackage, AbstractConverter } from "./AbstractPackage";
import { CONNECTOR_SYMMARY } from "./HeaderConstants";

export interface ConnectorSummary extends AbstractPackage {
  connectionCount: number;
  games: ConnectorGame[];
}

export interface ConnectorGame {
  gameId: number;
  gameName: string;
  mapName: string;
}

export class ConnectorSummaryConverter extends AbstractConverter {
  public assembly(data: ConnectorSummary) {
    const dataBuffer = new DataBuffer(new ArrayBuffer(5));

    dataBuffer.putUint8(CONNECTOR_SYMMARY);
    dataBuffer.putUint16(data.connectionCount);
    dataBuffer.putUint16(data.games.length);

    data.games.forEach((game) => {
      dataBuffer.putUint32(game.gameId);
      dataBuffer.putNullTerminatedString(game.gameName);
      dataBuffer.putNullTerminatedString(game.mapName);
    });

    return dataBuffer.toArrayBuffer();
  }

  public parse(dataBuffer: DataBuffer): ConnectorSummary {
    const connectionCount = dataBuffer.getUint16();
    const gameCount = dataBuffer.getUint16();

    let games = [];

    for (let i = 0; i < gameCount; ++i) {
      let game: ConnectorGame = {
        gameId: dataBuffer.getUint32(),
        gameName: dataBuffer.getNullTerminatedString(),
        mapName: dataBuffer.getNullTerminatedString(),
      };

      console.log(game)

      games[games.length] = game;
    }

    return {
      type: CONNECTOR_SYMMARY,
      connectionCount,
      games,
    };
  }
}
