import { GameListGame } from "../../models/websocket/ServerGameList";
import { Table } from "semantic-ui-react";
import GameListPlayers from "./GameListPlayers";

function GameList({ gameList }) {
  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Патч</Table.HeaderCell>
          <Table.HeaderCell>Игра</Table.HeaderCell>
          <Table.HeaderCell>Игроки</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {gameList.map((game: GameListGame) => {
          return (
            <Table.Row
              key={game.gameCounter}
              positive={game.started}
              error={game.hasGamePowerUp}
              warning={game.hasOtherGame}
            >
              <Table.Cell>1.26</Table.Cell>
              <Table.Cell>{game.name}</Table.Cell>
              <Table.Cell>
                <GameListPlayers players={game.players} />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

export default GameList;
