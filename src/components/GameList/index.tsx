import { Table } from "semantic-ui-react";
import GameListPlayers from "./GameListPlayers";
import React, { memo, useContext } from "react";
import ConnectorAddButton from "./ConnectorAddButton";

import "./GameList.scss";
import { GameListGame } from "./../../models/websocket/ServerGameList";
import ConnectorId from "../ConnectorId";
import SendSignalButton from "./SendSignalButton";
import ReactTimeAgo from "react-time-ago";
import classnames from "classnames";
import copy from "clipboard-copy";
import { AppRuntimeSettingsContext } from "../../context";
import { useBanners } from "../../hooks/useBanners";
import BannerView from "../Banner/BannerView";

interface GameListProps {
    gameList: GameListGame[];
    selectedGame: GameListGame | null;
    setSelectedGame: (game: GameListGame | null) => void;
}

function GameList({ gameList, selectedGame, setSelectedGame }: GameListProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    // Баннеры приходят с сервера (/v1/banners?placement=GAME_LIST): период показа,
    // ротация и скрытие от VIP уже учтены в useBanners.
    const { banners } = useBanners("GAME_LIST");

    const getPlayerSlots = (game: GameListGame): number => {
        let usedSlots = 0;

        game.players.forEach((player) => {
            if (player.name.length > 0) usedSlots++;
        });

        return usedSlots;
    };

    // Копия на каждый рендер: баннер вставляется в список не более одного раза
    // (при отрисовке строки его вырезают из остатка через splice).
    const remaingAdsRow = [...banners];

    return (
        <Table selectable>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell width={2}>{lang.gameListTableHeaderVersion}</Table.HeaderCell>
                    <Table.HeaderCell width={2}>{lang.gameListTableHeaderSlots}</Table.HeaderCell>
                    <Table.HeaderCell width={4}>{lang.gameListTableHeaderGameName}</Table.HeaderCell>
                    <Table.HeaderCell>{lang.gameListTableHeaderPlayers}</Table.HeaderCell>
                    <Table.HeaderCell width={2}>{lang.gameListTableHeaderOwner}</Table.HeaderCell>
                    <Table.HeaderCell width={2}></Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {gameList.map((game: GameListGame, index) => {
                    const classList = classnames(
                        "game-list-row",
                        {
                            "game-started": game.gameFlags.started,
                        },
                        {
                            "game-vip": game.gameFlags.hasGamePowerUp,
                        },
                        {
                            "game-external": game.gameFlags.hasOtherGame,
                        },
                        {
                            "game-selected": game.gameCounter === selectedGame?.gameCounter,
                        }
                    );

                    const rowIndex =
                        (remaingAdsRow.findIndex((i) => i.index === index) + 1 ||
                            remaingAdsRow.findIndex((i) => i.creatorId === game.creatorID) + 1) - 1;

                    const adsRow = rowIndex === -1 ? null : remaingAdsRow.splice(rowIndex, 1)[0];

                    return (
                        <React.Fragment key={game.gameCounter}>
                            <Table.Row
                                className={classList}
                                onClick={() => {
                                    if (selectedGame?.gameCounter === game.gameCounter) setSelectedGame(null);
                                    else setSelectedGame(game);
                                }}
                            >
                                <Table.Cell>{game.gameVersion}</Table.Cell>
                                <Table.Cell>{getPlayerSlots(game) + "/" + game.players.length}</Table.Cell>
                                <Table.Cell>
                                    <div className="game-title">{game.name}</div>
                                    {game.gameFlags.started && (
                                        <span className="duration">
                                            (
                                            <ReactTimeAgo
                                                date={new Date(Date.now() - game.gameTicks)}
                                                locale={language.currentLocale}
                                            />
                                            )
                                        </span>
                                    )}
                                    {game.iccupHost && !game.gameFlags.started && (
                                        <span className="iccup" title={lang.copy} onClick={() => copy(game.iccupHost)}>
                                            ({game.iccupHost})
                                        </span>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <GameListPlayers players={game.players} />
                                </Table.Cell>
                                <Table.Cell>
                                    <ConnectorId id={game.creatorID} />
                                </Table.Cell>
                                <Table.Cell>
                                    <ConnectorAddButton game={game} />
                                    <SendSignalButton game={game} />
                                </Table.Cell>
                            </Table.Row>
                            {adsRow && (
                                <Table.Row>
                                    <Table.Cell colSpan="5">
                                        <BannerView banner={adsRow} />
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </React.Fragment>
                    );
                })}
            </Table.Body>
        </Table>
    );
}

export default memo(GameList);
