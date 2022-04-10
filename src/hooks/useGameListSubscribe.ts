import { useEffect } from "react";
import { DEFAULT_GAME_LIST } from "../models/websocket/HeaderConstants";
import {
  GameListGame,
  ServerGameList,
} from "../models/websocket/ServerGameList";
import {
  GHostPackageEvent,
  GHostWebSocket,
} from "./../services/GHostWebsocket";
import { ClientGameListConverter } from "../models/websocket/ClientGameList";

interface GameListSubscribeOptions {
  ghostSocket: GHostWebSocket;
  isGameListLocked: boolean;
  onGameList: (games: GameListGame[]) => void;
}

export const useGameListSubscribe = ({
  ghostSocket,
  isGameListLocked,
  onGameList,
}: GameListSubscribeOptions) => {
  useEffect(() => {
    let intervalId;

    const sendGameListRequest = () => {
      if (ghostSocket.isConnected()) {
        let clientGameListConverter = new ClientGameListConverter();
        ghostSocket.send(
          clientGameListConverter.assembly({ filters: 0xffffffff })
        );
      }
    };

    const trySendGameList = () => {
      if (document.hasFocus() && !isGameListLocked) sendGameListRequest();
      else intervalId = setTimeout(trySendGameList, 500);
    };

    const onPackage = (event: GHostPackageEvent) => {
      if (event.detail.package.type == DEFAULT_GAME_LIST) {
        const gameList: ServerGameList = event.detail.package as ServerGameList;
        onGameList(gameList.games);

        clearTimeout(intervalId);
        intervalId = setTimeout(trySendGameList, 3000);
      }
    };

    if (ghostSocket.isConnected()) {
      let clientGameListConverter = new ClientGameListConverter();
      ghostSocket.send(
        clientGameListConverter.assembly({ filters: 0xffffffff })
      );
    }

    const onConnectOpen = () => sendGameListRequest();

    const onConnectClose = () => {
      clearTimeout(intervalId);
      intervalId = null;
    };

    ghostSocket.addEventListener("package", onPackage);
    ghostSocket.addEventListener("open", onConnectOpen);
    ghostSocket.addEventListener("close", onConnectClose);

    return () => {
      clearInterval(intervalId);

      ghostSocket.removeEventListener("package", onPackage);
      ghostSocket.removeEventListener("open", onConnectOpen);
      ghostSocket.removeEventListener("close", onConnectClose);
    };
  }, [ghostSocket, isGameListLocked]);
};
