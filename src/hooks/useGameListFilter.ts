import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext, RestContext } from "../context";
import { GameDataShort } from "../models/rest/Game";
import { GameListGame } from "../models/websocket/ServerGameList";
import {
    allSlotsComparator,
    defaultComparator,
    freeSlotsComparator,
    gameTypeComparator,
    playersOccupiedComparator,
} from "../utils/GameListComparators";

export interface FilterSettings {
    quickFilter: string;
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
    hiddenPatch: string[];
}

interface useGameListFilterOptions {
    gameList: GameDataShort[];
    filters: FilterSettings;
}

export const useGameListFilter = ({ gameList, filters }: useGameListFilterOptions): GameDataShort[] => {
    const currentAuth = useContext(AuthContext).auth.currentAuth;

    const [allowMapIds, setAllowMapIds] = useState<number[] | null>(null);

    const { mapsApi } = useContext(RestContext);

    useEffect(() => {
        if (filters.onlyFavoritedMaps) {
            let abort = new AbortController();

            mapsApi
                .searchMap({ favorite: true }, {}, undefined, { count: 200 }, { signal: abort.signal })
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
                game.slots.forEach((slot) => {
                    if (slot.player) playersCount++;
                });

                return playersCount;
            })();

            if(currentAuth && game.creatorUserId === currentAuth.connectorId.toString())
                return true;

            // Game Type Filter

            if (filters.gameType) {
                if (filters.gameType === 1 && game.isAutohost) return false;

                if (filters.gameType === 2 && !game.isAutohost) return false;
            }

            if (currentAuth && filters.onlySelfGames && game.creatorUserId === currentAuth.connectorId.toString()) return false;

            // Slots filter

            if (game.slots.length < filters.slots[0] || game.slots.length > filters.slots[1]) return false;

            if (playersCount < filters.players[0] || playersCount > filters.players[1]) return false;

            if (
                game.slots.length - playersCount < filters.freeSlots[0] ||
                game.slots.length - playersCount > filters.freeSlots[1]
            )
                return false;

            // Favorited maps only filter

            if (filters.onlyFavoritedMaps && allowMapIds) {
                if (allowMapIds.indexOf(game.mapId) === -1) {
                    return false;
                }
            }

            if(filters.hiddenPatch.length > 0) {
                if(filters.hiddenPatch.indexOf(game.gameVersion) != -1)
                    return false;
            }

            // Hide another hosts if exsists local

            if(game.ownerBot.external) {
                const hasExists = gameList.some((i) => i.mapId == game.mapId && !i.started && !i.ownerBot.external);

                if(hasExists) return false;
            }

            // Quick filter

            const queryQuickFilter = filters.quickFilter.trim().toLowerCase();

            if (queryQuickFilter.length === 0) return true;

            if (game.mapId.toString() === filters.quickFilter) {
                return true;
            }

            if (game.name.toLocaleLowerCase().indexOf(queryQuickFilter) >= 0) return true;

            const players = game.slots.filter((slot) => {
                if (!slot.player) return false;
                if (slot.player.name.toLocaleLowerCase().indexOf(queryQuickFilter) >= 0) return true;
                return false;
            });

            if (players.length > 0) return true;

            return false;
        });

        // Order

        const creatorComparator = (a: GameDataShort, b: GameDataShort) => {
            if (a.creatorUserId === b.creatorUserId && a.creatorUserId === currentAuth?.connectorId.toString()) return 0;

            if (a.creatorUserId === currentAuth?.connectorId.toString()) return -1;

            if (b.creatorUserId === currentAuth?.connectorId.toString()) return 1;

            return 0;
        };

        return filtredGames.sort((a, b) => {
            return (
                gameTypeComparator(a, b) ||
                creatorComparator(a, b) ||
                getCompareFunction(filters.orderBy)(a, b) * (filters.reverseOrder ? -1 : 1)
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
