import { useContext, useEffect, useState } from "react";
import { GameListGame } from "./../models/websocket/ServerGameList";
import { FilterSettings } from "./useGameListFilter";
import { useRef } from "react";

export interface DisplayedGameListParams {
  gameList: GameListGame[];
  filters?: FilterSettings;
}

export function useDisplayedGameList({
  gameList,
  filters,
}: DisplayedGameListParams) {
  const [displayedGameList, setDisplayedGameList] = useState<GameListGame[]>(
    []
  );

  const gameListRef = useRef(gameList);
  gameListRef.current = gameList;

  const displayedGameListRef = useRef(displayedGameList);
  displayedGameListRef.current = displayedGameList;

  useEffect(() => {
    setDisplayedGameList(gameListRef.current);
  }, [filters]);

  useEffect(() => {
    if (displayedGameList.length === 0 || filters.forceReorder) {
      setDisplayedGameList(gameList);

      return;
    }

    const getGameById = (games: GameListGame[], id: number) => {
      return games.find((i) => i.gameCounter === id);
    };

    const newGames = gameList.filter((i) => {
      return !getGameById(displayedGameListRef.current, i.gameCounter);
    });

    const startedNewGames = newGames.filter((i) => i.gameFlags.started);
    const notStartedNewGames = newGames.filter((i) => !i.gameFlags.started);

    // Remove deleted games

    const updatedGameList = displayedGameListRef.current.filter((i) => {
      return getGameById(gameList, i.gameCounter);
    });

    // Append new games to the top of the list

    updatedGameList.push(...startedNewGames);
    updatedGameList.unshift(...notStartedNewGames);

    const gl = updatedGameList
      .map((i) => {
        return getGameById(gameList, i.gameCounter);
      })
      .filter((i) => i);

    setDisplayedGameList(gl);
  }, [gameList, filters]);

  return displayedGameList;
}
