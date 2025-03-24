import { useContext, useEffect, useState } from "react";
import { FilterSettings } from "./useGameListFilter";
import { useRef } from "react";
import { GameDataShort } from "../models/rest/Game";

export interface DisplayedGameListParams {
    gameList: GameDataShort[];
    filters?: FilterSettings;
}

export function useDisplayedGameList({ gameList, filters }: DisplayedGameListParams) {
    const [displayedGameList, setDisplayedGameList] = useState<GameDataShort[]>([]);

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

        const getGameById = (games: GameDataShort[], id: number) => {
            return games.find((i) => i.id === id);
        };

        const newGames = gameList.filter((i) => {
            return !getGameById(displayedGameListRef.current, i.id);
        });

        const startedNewGames = newGames.filter((i) => i.started);
        const notStartedNewGames = newGames.filter((i) => !i.started);

        // Remove deleted games

        const updatedGameList = displayedGameListRef.current.filter((i) => {
            return getGameById(gameList, i.id);
        });

        // Append new games to the top of the list

        updatedGameList.push(...startedNewGames);
        updatedGameList.unshift(...notStartedNewGames);

        const gl = updatedGameList
            .map((i) => {
                return getGameById(gameList, i.id);
            })
            .filter((i) => i);

        setDisplayedGameList(gl);
    }, [gameList, filters]);

    return displayedGameList;
}
