import React from "react";
import { Button, List, Placeholder, Popup } from "semantic-ui-react";
import { GameListPlayer } from "../../models/websocket/ServerGameList";
import GameListPlayerItem from "./GameListPlayerItem";
import "./GameListPlayers.scss";

interface GameListPlayerProps {
  players: GameListPlayer[];
}

function GameListPlayers({ players }: GameListPlayerProps) {
  return (
    <List horizontal>
      {players.map((player) => {
        return player.name.length > 0 ? (
          <GameListPlayerItem key={player.name} player={player} />
        ) : null;
      })}
    </List>
  );
}

export default GameListPlayers;
