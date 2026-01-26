import { useContext, useEffect, useRef } from "react";
import { FilterSettings } from "./useGameListFilter";
import { RestContext } from "../context/index";
import { toast } from "@kokomi/react-semantic-toasts";
import { getGameNotificationRules, GameNotificationRule } from "../utils/GameNotificationRules";
import { FavoriteMaps } from "../utils/FavoriteMaps";
import { AppRuntimeSettingsContext } from "../context";
import { DEFAULT_GAME_LIST } from "../models/websocket/HeaderConstants";
import { GameListGame, GameListGameFlags, ServerGameList } from "../models/websocket/ServerGameList";
import { GHostPackageEvent, GHostWebSocket } from "./../services/GHostWebsocket";

const checkGameMatchesRule = (game: GameListGame, rule: GameNotificationRule): boolean => {
    switch (rule.type) {
        case "favorite_map":
            return FavoriteMaps.listMaps().has(game.mapId);
        case "player_nickname":
            return game.players.some((player) => player.name === rule.nickname);
        case "game_name_substring":
            return game.name.toLowerCase().includes(rule.substring!.toLowerCase());
        default:
            return false;
    }
};

interface GameListSubscribeOptions {
    ghostSocket: GHostWebSocket;
    isGameListLocked: boolean;
    onGameList: (games: GameListGame[]) => void;
    filters?: FilterSettings;
    ignoreFocusCheck: boolean;
}

const replaceRules: Record<string, Partial<GameListGame>> = {
    WC3Game_7: {
        gameFlags: new GameListGameFlags(4),
        gamePosition: 1,
    },
    "WC3.Game_111": {
        gameFlags: new GameListGameFlags(4),
        gamePosition: 1,
    },
    "oz.ltdx20": {
        gameFlags: new GameListGameFlags(4),
        gamePosition: 1,
    },
    WC3Game_15: {
        gameFlags: new GameListGameFlags(4),
        gamePosition: 1,
    },
    "oz.lia": {
        gameFlags: new GameListGameFlags(4),
        gamePosition: 1,
    },
    WC3Game_18: {
        gameFlags: new GameListGameFlags(4),
        gamePosition: 1,
    },
    WC3Game_10: {
        gameFlags: new GameListGameFlags(4),
        gamePosition: 1,
    },
};

export const useGameListSubscribe = ({
    ghostSocket,
    isGameListLocked,
    onGameList,
    filters,
    ignoreFocusCheck,
}: GameListSubscribeOptions) => {
    const { mapsApi } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const previousGamesRef = useRef<GameListGame[]>([]);

    useEffect(() => {
        let intervalId;
        const abortController = new AbortController();

        const trySendGameList = () => {
            if ((document.hasFocus() || ignoreFocusCheck) && !isGameListLocked) {
                // Do nothing, wait for websocket
            } else {
                intervalId = setTimeout(trySendGameList, 500);
            }
        };

        const onPackage = (event: GHostPackageEvent) => {
            if (event.detail.package.type === DEFAULT_GAME_LIST) {
                const gameList: ServerGameList = event.detail.package as ServerGameList;

                const replacedGames = gameList.games.map((i) => {
                    if (i.gameFlags.hasOtherGame) return { ...i, ...replaceRules[i.iccupHost] };

                    return i;
                });

                onGameList(replacedGames);

                // Check for new games and notify
                const rules = getGameNotificationRules();
                if (rules.length > 0) {
                    const previousGameIds = new Set(previousGamesRef.current.map((g) => g.gameCounter));
                    const newGames = replacedGames.filter((g) => !previousGameIds.has(g.gameCounter));
                    newGames.forEach((game) => {
                        const matchingRules = rules.filter((rule) => checkGameMatchesRule(game, rule));
                        if (matchingRules.length > 0) {
                            toast({
                                title: lang.hookGameNotificationTitle,
                                description: lang.hookGameNotificationDescription.replace("{gameName}", game.name),
                                type: "info",
                                time: 5000,
                            });
                        }
                    });
                }
                previousGamesRef.current = replacedGames;

                clearTimeout(intervalId);
                intervalId = setTimeout(trySendGameList, 3000);
            }
        };

        if (ghostSocket.isConnected()) {
            trySendGameList();
        }

        const onConnectOpen = () => {};

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
            abortController.abort();

            ghostSocket.removeEventListener("package", onPackage);
            ghostSocket.removeEventListener("open", onConnectOpen);
            ghostSocket.removeEventListener("close", onConnectClose);
        };
    }, [
        ghostSocket,
        isGameListLocked,
        filters?.noLoadStarted,
        onGameList,
        ignoreFocusCheck,
        mapsApi,
        lang.hookGameNotificationTitle,
        lang.hookGameNotificationDescription,
    ]);
};
