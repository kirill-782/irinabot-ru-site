import { useMemo } from "react";
import { GameListGame } from "../models/websocket/ServerGameList";
import {
  allSlotsSort,
  defaultSort,
  freeSlotsSort,
  gameTypeSort,
  playersOccupiedSlot,
} from "../utils/GameListSortMethods";

interface useGameListFilterOptions {
  gameList: GameListGame[];
  quicFilter?: string;
  reverseOrder: boolean;
  orderName: string;
}

export const useGameListFilter = ({
  gameList,
  quicFilter,
  reverseOrder,
  orderName,
}: useGameListFilterOptions) => {
  return useMemo(() => {
    let filtredGames = gameList.filter((game) => {
      if (quicFilter.length == 0) return true;

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
        if (player.name.length == 0) return false;
        if (
          player.name.toLocaleLowerCase().search(quicFilter.toLowerCase()) >= 0
        )
          return true;
        return false;
      });

      if (players.length > 0) return true;

      return false;
    });

    return filtredGames.sort((a, b) => {
      return (
        gameTypeSort(a, b) ||
        getOrderFunction(orderName)(a, b) * (reverseOrder ? -1 : 1)
      );
    });
  }, [gameList, quicFilter, orderName, reverseOrder]);
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
