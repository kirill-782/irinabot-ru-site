import { useContext, useMemo } from "react";
import { AuthContext } from "../context";
import { GameListGame } from "../models/websocket/ServerGameList";
import { allSlotsSort, defaultSort, freeSlotsSort, gameTypeSort, playersOccupiedSlot } from "../utils/GameListSortMethods";


export interface FilterSettings {
  noLoadStarted: boolean;
  onlySelfGames: boolean;
  gameType: 0 | 1 | 2;
  orderBy: string;
  reverseOrder: boolean;
  minPlayers: number;
  maxPlayers: number;
  minFreeSlots: number;
  maxFreeSlots: number;
  minSlots: number;
  maxSlots: number;
}

interface useGameListFilterOptions {
  gameList: GameListGame[];
  quicFilter?: string;
  filters: FilterSettings;
}

export const useGameListFilter = ({
  gameList,
  quicFilter,
  filters,
}: useGameListFilterOptions) => {

  const currentAuth = useContext(AuthContext).auth.currentAuth;

  return useMemo(() => {
    let filtredGames = gameList.filter((game) => {

      // Game Type Filter

      if (filters.gameType) {
        if (filters.gameType === 1 && game.orderID === 0) return false;

        if (filters.gameType === 2 && game.orderID !== 0) return false;
      }

      if(currentAuth && filters.onlySelfGames && currentAuth.connectorId !== game.creatorID)
        return false;

      // Quic filter

      if (quicFilter.length === 0) return true;

      if (game.name.toLocaleLowerCase().search(quicFilter.toLowerCase()) >= 0)
        return true;

      if (
        game.mapName.toLocaleLowerCase().search(quicFilter.toLowerCase()) >= 0
      )
        return true;

      if (
        game.mapFileName.toLocaleLowerCase().search(quicFilter.toLowerCase()) >=
        0
      )
        return true;

      const players = game.players.filter((player) => {
        if (player.name.length === 0) return false;
        if (
          player.name.toLocaleLowerCase().search(quicFilter.toLowerCase()) >= 0
        )
          return true;
        return false;
      });

      if (players.length > 0) return true;

      return false;
    });

    // Order

    return filtredGames.sort((a, b) => {
      return (
        gameTypeSort(a, b) ||
        getOrderFunction(filters.orderBy)(a, b) *
          (filters.reverseOrder ? -1 : 1)
      );
    });
  }, [gameList, quicFilter, filters]);
};

const getOrderFunction = (value) => {
  switch (value) {
    case "freeSlots":
      return freeSlotsSort;
    case "allSlots":
      return allSlotsSort;
    case "playerSlots":
      return playersOccupiedSlot;
    default:
      return defaultSort;
  }
};
