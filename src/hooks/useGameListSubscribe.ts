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
import {
  ClientGameListConverter,
  GAMELIST_FILTER_STARTED,
} from "../models/websocket/ClientGameList";
import { FilterSettings } from "./useGameListFilter";

interface GameListSubscribeOptions {
  ghostSocket: GHostWebSocket;
  isGameListLocked: boolean;
  onGameList: (games: GameListGame[]) => void;
  filters: FilterSettings;
}

export const useGameListSubscribe = ({
  ghostSocket,
  isGameListLocked,
  onGameList,
  filters,
}: GameListSubscribeOptions) => {
  useEffect(() => {
    let intervalId;

    const sendGameListRequest = () => {
      if (ghostSocket.isConnected()) {
        let filterFlags = 0xffffffff;

        if (filters.noLoadStarted) filterFlags &= ~GAMELIST_FILTER_STARTED;

        let clientGameListConverter = new ClientGameListConverter();
        ghostSocket.send(
          clientGameListConverter.assembly({ filters: filterFlags })
        );
      }
    };

    const trySendGameList = () => {
      if (document.hasFocus() && !isGameListLocked) sendGameListRequest();
      else intervalId = setTimeout(trySendGameList, 500);
    };

    const onPackage = (event: GHostPackageEvent) => {
      if (event.detail.package.type === DEFAULT_GAME_LIST) {
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

    if (ghostSocket.isConnected()) trySendGameList();

    return () => {
      clearInterval(intervalId);

      ghostSocket.removeEventListener("package", onPackage);
      ghostSocket.removeEventListener("open", onConnectOpen);
      ghostSocket.removeEventListener("close", onConnectClose);
    };
  }, [ghostSocket, isGameListLocked, filters, onGameList]);
};
