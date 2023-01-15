import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext, RestContext } from "../context";
import { GameListGame } from "../models/websocket/ServerGameList";
import {
  allSlotsComparator,
  defaultComparator,
  freeSlotsComparator,
  gameTypeComparator,
  playersOccupiedComparator,
} from "../utils/GameListComparators";

export interface FilterSettings {
  quicFilter: string;
  noLoadStarted: boolean;
  onlySelfGames: boolean;
  onlyFavoritedMaps: boolean;
  forceReorder: boolean;
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
}: useGameListFilterOptions): GameListGame[] => {
  const currentAuth = useContext(AuthContext).auth.currentAuth;

  const [allowMapIds, setAllowMapIds] = useState<number[] | null>(null);

  const { mapsApi } = useContext(RestContext);

  useEffect(() => {
    if (filters.onlyFavoritedMaps) {
      let abort = new AbortController();

      mapsApi
        .searchMap(
          { favorite: true },
          {},
          undefined,
          { count: 200 },
          { signal: abort.signal }
        )
        .then((maps) => {
          setAllowMapIds(maps.map((i) => i.id));
        });

      return () => {
        abort.abort();
      };
    } else setAllowMapIds(null);
  }, [mapsApi, filters]);

  return useMemo(() => {
    let filtredGames = gameList.filter((game) => {
      const playersCount = (() => {
        let playersCount = 0;
        game.players.forEach((player) => {
          if (player.name.length > 0) playersCount++;
        });

        return playersCount;
      })();

      // Game Type Filter

      if (filters.gameType) {
        if (filters.gameType === 1 && game.orderID === 0) return false;

        if (filters.gameType === 2 && game.orderID !== 0) return false;
      }

      if (
        currentAuth &&
        filters.onlySelfGames &&
        currentAuth.connectorId !== game.creatorID
      )
        return false;

      // Slots filter

      if (
        game.players.length < filters.slots[0] ||
        game.players.length > filters.slots[1]
      )
        return false;

      if (
        playersCount < filters.players[0] ||
        playersCount > filters.players[1]
      )
        return false;

      if (
        game.players.length - playersCount < filters.freeSlots[0] ||
        game.players.length - playersCount > filters.freeSlots[1]
      )
        return false;

      // Favorited maps only filter

      if (filters.onlyFavoritedMaps && allowMapIds) {
        if (allowMapIds.indexOf(game.mapId) === -1) {
          return false;
        }
      }

      // Quic filter

      if (filters.quicFilter.length === 0) return true;

      if (game.mapId.toString() === filters.quicFilter) {
        return true;
      }

      if (
        game.name
          .toLocaleLowerCase()
          .indexOf(filters.quicFilter.toLowerCase()) >= 0
      )
        return true;

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

      if (players.length > 0) return true;

      return false;
    });

    // Order

    const creatorComparator = (a: GameListGame, b: GameListGame) => {
      if (
        a.creatorID === b.creatorID &&
        a.creatorID === currentAuth?.connectorId
      )
        return 0;

      if (a.creatorID === currentAuth?.connectorId) return -1;

      if (b.creatorID === currentAuth?.connectorId) return 1;

      return 0;
    };

    return filtredGames.sort((a, b) => {
      return (
        gameTypeComparator(a, b) ||
        creatorComparator(a, b) ||
        getCompareFunction(filters.orderBy)(a, b) *
          (filters.reverseOrder ? -1 : 1)
      );
    });
  }, [gameList, filters, currentAuth, allowMapIds]);
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
