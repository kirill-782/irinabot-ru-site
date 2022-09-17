import { Image, Table } from "semantic-ui-react";
import GameListPlayers from "./GameListPlayers";
import React, { memo } from "react";
import ConnectorAddButton from "./ConnectorAddButton";

import "./GameList.scss";
import { GameListGameFilterExtends } from "../../hooks/useGameListFilter";
import { GameListGame } from "./../../models/websocket/ServerGameList";
import ConnectorId from "../ConnectorId";
import SendSignalButton from "./SendSignalButton";

// TODO AdsFile

const ADS = [
  {
    img: "https://irinabot.ru/kaisa/XGMLogo.png",
    link: "https://xgm.guru/p/wc3/xgm-irina-autohost",
    index: 10,
  },
];

interface GameListProps {
  gameList: GameListGame[];
  selectedGame: GameListGame | null;
  setSelectedGame: (game: GameListGame | null) => void;
}

function GameList({ gameList, selectedGame, setSelectedGame }: GameListProps) {
  const getPlayerSlots = (game: GameListGameFilterExtends): number => {
    let usedSlots = 0;

    game.players.forEach((player) => {
      if (player.name.length > 0) usedSlots++;
    });

    return usedSlots;
  };

  return (
    <Table selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={2}>Слоты</Table.HeaderCell>
          <Table.HeaderCell width={2}>Владелец</Table.HeaderCell>
          <Table.HeaderCell width={4}>Игра</Table.HeaderCell>
          <Table.HeaderCell>Игроки</Table.HeaderCell>
          <Table.HeaderCell width={2}></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {gameList.map((game: GameListGameFilterExtends, index) => {
          const started = game.gameFlags.started ? "game-started" : "";
          const vip = game.gameFlags.hasGamePowerUp ? "game-vip" : "";
          const external = game.gameFlags.hasOtherGame ? "game-external" : "";
          const hidden = game.hidden ? "hidden" : "";
          const selected =
            game.gameCounter === selectedGame?.gameCounter
              ? "game-selected"
              : "";

          const adsRow = ADS.filter((i) => i.index === index)[0];

          return (
            <React.Fragment key={game.gameCounter}>
              <Table.Row
                className={`${started} ${vip} ${external} ${hidden} ${selected}`}
                onClick={() => {
                  if (selectedGame?.gameCounter === game.gameCounter)
                    setSelectedGame(null);
                  else setSelectedGame(game);
                }}
              >
                <Table.Cell>
                  {getPlayerSlots(game) + "/" + game.players.length}
                </Table.Cell>
                <Table.Cell>
                  <ConnectorId id={game.creatorID} />
                </Table.Cell>
                <Table.Cell>
                  <div className="game-title">{game.name}</div>
                </Table.Cell>
                <Table.Cell>
                  <GameListPlayers players={game.players} />
                </Table.Cell>
                <Table.Cell>
                  <ConnectorAddButton game={game} />
                  <SendSignalButton game={game} />
                </Table.Cell>
              </Table.Row>
              {adsRow && (
                <Table.Row>
                  <Table.Cell colspan="5">
                    <a href={adsRow.link}>
                      <Image style={{ width: "100%" }} src={adsRow.img}></Image>
                    </a>
                  </Table.Cell>
                </Table.Row>
              )}
            </React.Fragment>
          );
        })}
      </Table.Body>
    </Table>
  );
}

export default memo(GameList);
