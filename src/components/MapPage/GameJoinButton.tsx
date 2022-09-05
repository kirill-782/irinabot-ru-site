import { Button } from "semantic-ui-react";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { useContext, useState } from "react";
import { useEffect } from "react";
import { AuthContext, WebsocketContext } from "../../context";
import { ClientRequestUDPGameConverter } from "../../models/websocket/ClientRequestUDPGame";
import React from "react";

interface GameJoinButtonProps {
  gameList: GameListGame[];
  mapId: number;
}

function GameJoinButton({ gameList, mapId }: GameJoinButtonProps) {
  const [foundGame, setFoundGame] = useState<GameListGame>();

  const sockets = useContext(WebsocketContext);
  const auth = useContext(AuthContext).auth;

  const requestConnectorGame = () => {
    if (!foundGame) return;

    const converter = new ClientRequestUDPGameConverter();
    sockets.ghostSocket.send(
      converter.assembly({
        gameId: foundGame.gameCounter,
        isPrivateKey: false,
        password: "",
      })
    );
  };

  const isEnabled =
    auth.currentAuth !== null && sockets.isConnectorSocketConnected;

  useEffect(() => {
    let game: GameListGame | undefined;

    gameList.forEach((i) => {
      if (
        !i.gameFlags.started &&
        i.mapId === mapId &&
        !i.gameFlags.hasPassword
      ) {
        game = i;
      }
    });

    setFoundGame(game);
  }, [gameList, mapId]);

  return (
    <Button
      disabled={!foundGame || !isEnabled}
      icon="gamepad"
      title="Войти в игру"
    ></Button>
  );
}

export default GameJoinButton;
