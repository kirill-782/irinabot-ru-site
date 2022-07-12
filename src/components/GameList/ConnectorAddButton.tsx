import { Button } from "semantic-ui-react";
import React, { useContext } from "react";
import { WebsocketContext } from "../../context";
import { AuthContext } from "./../../context/index";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { ClientRequestUDPGameConverter } from "../../models/websocket/ClientRequestUDPGame";

interface ConnectorAddButtonProps {
  game: GameListGame;
}

function ConnectorAddButton({ game }: ConnectorAddButtonProps) {
  const sockets = useContext(WebsocketContext);
  const auth = useContext(AuthContext).auth;

  const requestConnectorGame = () => {
    const converter = new ClientRequestUDPGameConverter();
    sockets.ghostSocket.send(
      converter.assembly({
        gameId: game.gameCounter,
        isPrivateKey: false,
        password: "",
      })
    );
  };

  const isEnabled =
    auth.currentAuth !== null && sockets.isConnectorSocketConnected;

  if (game.gameFlags.started) return null;

  return (
    <Button
      icon="gamepad"
      disabled={!isEnabled}
      color={isEnabled ? "green" : "red"}
      basic
      size="mini"
      onClick={requestConnectorGame}
    />
  );
}

export default ConnectorAddButton;
