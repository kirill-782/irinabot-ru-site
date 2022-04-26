import { useContext, useMemo } from "react";
import { AuthContext } from "../context";
import { GameListGame } from "../models/websocket/ServerGameList";
import {
  allSlotsComparator,
  defaultComparator,
  freeSlotsComparator,
  gameTypeComparator,
  playersOccupiedComparator,
} from "../utils/GameListComparators";

const REMOVE_FILTRED = true;

export interface GameListGameFilterExtends extends GameListGame {
  hidden?: boolean;
}

export interface FilterSettings {
  quicFilter: string;
  noLoadStarted: boolean;
  onlySelfGames: boolean;
  gameType: 0 | 1 | 2;
  orderBy: string;
  reverseOrder: boolean;
  players: [number, number];
  freeSlots: [number, number];
  slots: [number, number];
}

interface useGameListFilterOptions {
  gameList: GameListGame[];
  filters: FilterSettings;
}

export const useGameListFilter = ({
  gameList,
  filters,
}: useGameListFilterOptions): GameListGameFilterExtends[] => {
  const currentAuth = useContext(AuthContext).auth.currentAuth;

  return useMemo(() => {
    let filtredGames = gameList.map((game) => {
      const playersCount = (() => {
        let playersCount = 0;
        game.players.forEach((player) => {
          if (player.name.length > 0) playersCount++;
        });

        return playersCount;
      })();

      // Game Type Filter

      if (filters.gameType) {
        if (filters.gameType === 1 && game.orderID === 0)
          return { ...game, hidden: true };

        if (filters.gameType === 2 && game.orderID !== 0)
          return { ...game, hidden: true };
      }

      if (
        currentAuth &&
        filters.onlySelfGames &&
        currentAuth.connectorId !== game.creatorID
      )
        return { ...game, hidden: true };

      // Slots filter

      if (
        game.players.length < filters.slots[0] ||
        game.players.length > filters.slots[1]
      )
        return { ...game, hidden: true };

      if (
        playersCount < filters.players[0] ||
        playersCount > filters.players[1]
      )
        return { ...game, hidden: true };

      if (
        game.players.length - playersCount < filters.freeSlots[0] ||
        game.players.length - playersCount > filters.freeSlots[1]
      )
        return { ...game, hidden: true };

      // Quic filter

      if (filters.quicFilter.length === 0) return { ...game, hidden: false };

      if (
        game.name
          .toLocaleLowerCase()
          .indexOf(filters.quicFilter.toLowerCase()) >= 0
      )
        return { ...game, hidden: false };

      if (
        game.mapName
          .toLocaleLowerCase()
          .indexOf(filters.quicFilter.toLowerCase()) >= 0
      )
        return { ...game, hidden: false };

      if (
        game.mapFileName
          .toLocaleLowerCase()
          .indexOf(filters.quicFilter.toLowerCase()) >= 0
      )
        return { ...game, hidden: false };

      const players = game.players.filter((player) => {
        if (player.name.length === 0) return false;
        if (
          player.name
            .toLocaleLowerCase()
            .indexOf(filters.quicFilter.toLowerCase()) >= 0
        )
          return true;
        return false;
      });

      if (players.length > 0) return { ...game, hidden: false };

      return { ...game, hidden: true };
    });

    if (REMOVE_FILTRED)
      filtredGames = filtredGames.filter((game) => {
        return !game.hidden;
      });

    // Order

    return filtredGames.sort((a, b) => {
      return (
        gameTypeComparator(a, b) ||
        getCompareFunction(filters.orderBy)(a, b) *
          (filters.reverseOrder ? -1 : 1)
      );
    });
  }, [gameList, filters, currentAuth]);
};

const getCompareFunction = (value) => {
  switch (value) {
    case "freeSlots":
      return freeSlotsComparator;
    case "allSlots":
      return allSlotsComparator;
    case "playerSlots":
      return playersOccupiedComparator;
    default:
      return defaultComparator;
  }
};
