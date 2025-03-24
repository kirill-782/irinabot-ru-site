import { useContext, useEffect } from "react";
import { FilterSettings } from "./useGameListFilter";
import { GameDataShort } from "../models/rest/Game";
import { RestContext } from "../context/index";

interface GameListSubscribeOptions {
    isGameListLocked: boolean;
    onGameList: (games: GameDataShort[]) => void;
    filters?: FilterSettings;
    ignoreFocusCheck: boolean;
}

export const useGameListSubscribe = ({
    isGameListLocked,
    onGameList,
    filters,
    ignoreFocusCheck,
}: GameListSubscribeOptions) => {
    const { gamesApi } = useContext(RestContext);

    useEffect(() => {
        let intervalId;
        let abortController = new AbortController();

        const sendGameListRequest = async () => {
            try {
                const x = await gamesApi.getGames(
                    {
                        started: filters?.noLoadStarted ? false : undefined,
                    },
                    { signal: abortController.signal }
                );
                console.log(x);
                onGameList(x);
            } catch (e) {}

            clearTimeout(intervalId);
            intervalId = setTimeout(trySendGameList, 3000);
        };

        const trySendGameList = () => {
            if ((document.hasFocus() || ignoreFocusCheck) && !isGameListLocked) sendGameListRequest();
            else intervalId = setTimeout(trySendGameList, 500);
        };

        trySendGameList();

        return () => {
            clearInterval(intervalId);
            abortController.abort();
        };
    }, [gamesApi, isGameListLocked, filters?.noLoadStarted, onGameList, ignoreFocusCheck]);
};
