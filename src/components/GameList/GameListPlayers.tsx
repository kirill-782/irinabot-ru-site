import { List } from "semantic-ui-react";
import { GameListPlayer } from "../../models/websocket/ServerGameList";

interface GameListPlayerProps {
  players: GameListPlayer[];
}

const realmToText = {
  "178.218.214.114": "iCCup",
  connector: "IrInA Connector",
  "127.0.0.1": "Игрок другой платформы"
};

function GameListPlayers({ players }: GameListPlayerProps) {
  return (
    <List horizontal>
      {players.map((player) => {
        return player.name.length > 0 ? (
          <List.Item
            key={player.name}
            as="a"
            title={
              realmToText[player.realm] == undefined
                ? player.realm
                : realmToText[player.realm]
            }
          >
            {player.name}
          </List.Item>
        ) : null;
      })}
    </List>
  );
}

export default GameListPlayers;
