import { Table } from "semantic-ui-react";
import { memo, useContext, useMemo } from "react";
import { GameListGame } from "../../models/websocket/ServerGameList";
import {
    OnlineStatsRow,
    realmCategoryToRealmName,
    realmToCategory,
    statsRowComparator,
} from "../../config/PvpGNConfig";
import React from "react";
import { AppRuntimeSettingsContext } from "../../context";

interface OnlineStatsProps {
    gameList: GameListGame[];
}

class NeverError extends Error {
    // если дело дойдет до вызова конструктора с параметром - ts выдаст ошибку
    constructor(value: never) {
        super(`Unreachable statement: ${value}`);
    }
}

function OnlineStats({ gameList }: OnlineStatsProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const t = language.getString;

    const gameStats = useMemo<OnlineStatsRow[]>(() => {
        let stats: Map<String, OnlineStatsRow> = new Map();

        const appendToStats = (statsPart: OnlineStatsRow) => {
            const statsRow = stats.get(statsPart.categoryType + statsPart.categoryArgument);

            if (statsRow) {
                statsRow.lobbyCount += statsPart.lobbyCount;
                statsRow.playersCount += statsPart.playersCount;
            } else {
                stats.set(statsPart.categoryType + statsPart.categoryArgument, statsPart);
            }
        };

        gameList.forEach((game) => {
            // Process players

            let playersCount = 0;

            game.players.forEach((player) => {
                if (player.name.length === 0) return;

                playersCount++;

                if (!realmToCategory[player.realm])
                    appendToStats({
                        categoryType: "other",
                        categoryArgument: "",
                        lobbyCount: 0,
                        playersCount: 1,
                    });
                else
                    appendToStats({
                        categoryType: "realm",
                        categoryArgument: realmToCategory[player.realm],
                        lobbyCount: 0,
                        playersCount: 1,
                    });
            });

            appendToStats({ categoryType: "patch", categoryArgument: game.gameVersion, lobbyCount: 1, playersCount });

            if (game.gameFlags.started) appendToStats({
                categoryType: "started",
                categoryArgument: "",
                lobbyCount: 1,
                playersCount,
            });
            else appendToStats({ categoryType: "lobby", categoryArgument: "", lobbyCount: 1, playersCount });

            appendToStats({ categoryType: "all", lobbyCount: 1, categoryArgument: "", playersCount });
        });

        return Array.from(stats.values()).sort(statsRowComparator);
    }, [gameList]);

    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>{lang.onlineStatsCategory}</Table.HeaderCell>
                    <Table.HeaderCell>{lang.onlineStatsGames}</Table.HeaderCell>
                    <Table.HeaderCell>{lang.onlineStatsPlayers}</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {gameStats.map((gameStatsRow) => {
                    let rowString = "";

                    switch (gameStatsRow.categoryType) {
                        case "all":
                            rowString = lang.onlineStatsCategoryTypeAll;
                            break;
                        case "lobby":
                            rowString = lang.onlineStatsCategoryTypeLobby;
                            break;
                        case "other":
                            rowString = lang.onlineStatsCategoryTypeOther;
                            break;
                        case "patch":
                            rowString = t("onlineStatsCategoryTypePatch", { patch: gameStatsRow.categoryArgument });
                            break;
                        case "realm":
                            rowString = t("onlineStatsCategoryTypeRealm", { realm: realmCategoryToRealmName[gameStatsRow.categoryArgument] });
                            break;
                        case "started":
                            rowString = lang.onlineStatsCategoryTypeStarted;
                            break;
                        default:
                            const unknownType: never = gameStatsRow.categoryType;
                            throw new Error(`Unknown type ${unknownType}`);
                    }

                    return (
                        <Table.Row key={gameStatsRow.categoryType + gameStatsRow.categoryArgument}>
                            <Table.Cell>{rowString}</Table.Cell>
                            <Table.Cell>{gameStatsRow.lobbyCount > 0 ? gameStatsRow.lobbyCount : ""}</Table.Cell>
                            <Table.Cell>{gameStatsRow.playersCount}</Table.Cell>
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table>
    );
}

export default memo(OnlineStats);
