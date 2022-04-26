import { Table } from "semantic-ui-react";
import GameListPlayers from "./GameListPlayers";
import React from "react";
import ConnectorAddButton from "./ConnectorAddButton";

import "./GameList.scss";
import { GameListGameFilterExtends } from "../../hooks/useGameListFilter";

function GameList({ gameList }) {
  const getPlayerSlots = (game: GameListGameFilterExtends): number => {
    let usedSlots = 0;

    game.players.forEach((player) => {
      if (player.name.length > 0) usedSlots++;
    });

    return usedSlots;
  };

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Патч</Table.HeaderCell>
          <Table.HeaderCell>Слоты</Table.HeaderCell>
          <Table.HeaderCell>Игра</Table.HeaderCell>
          <Table.HeaderCell>Игроки</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {gameList.map((game: GameListGameFilterExtends) => {
          return (
            <Table.Row
              key={game.gameCounter}
              positive={game.started}
              error={game.hasGamePowerUp}
              warning={game.hasOtherGame}
              className={game.hidden ? "hidden" : ""}
            >
              <Table.Cell>1.26</Table.Cell>
              <Table.Cell>
                {getPlayerSlots(game) + "/" + game.players.length}
              </Table.Cell>
              <Table.Cell className="game-title">{game.name}</Table.Cell>
              <Table.Cell>
                <GameListPlayers players={game.players} />
              </Table.Cell>
              <Table.Cell>
                <ConnectorAddButton game={game} />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

export default GameList;
