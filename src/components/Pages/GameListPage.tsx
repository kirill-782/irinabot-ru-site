import React, { useContext, useEffect, useState } from "react";
import { Button, Container, Grid, Input, Message } from "semantic-ui-react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../../context";
import { GameListGame } from "../../models/websocket/ServerGameList";
import GameList from "../GameList";
import OnlineStats from "../GameList/OnlineStats";

import { useGameListSubscribe } from "../../hooks/useGameListSubscribe";
import { useGameListFilterSetings } from "../../hooks/useGameListFilterSetings";
import { useGameListFilter } from "../../hooks/useGameListFilter";
import { useDisplayedGameList } from "../../hooks/useDisplayedGameList";

import { useDebounce } from "../../hooks/useDebounce";
import { CacheContext } from "../../context";

import "../GameList/GameList.scss";
import MapInfo from "../GameList/MapInfo";
import { Link, NavLink } from "react-router-dom";
import { ClientResolveConnectorIdsConverter } from "../../models/websocket/ClientResolveConnectorIds";
import { SITE_TITLE } from "../../config/ApplicationConfig";
import MetaDescription from "../Meta/MetaDescription";
import { AuthContext } from "../../context";
import { AccessMaskBit } from "../Modal/AccessMaskModal";
import GameListFiltersModal from "../Modal/GameListFiltersModal";
import MetaCanonical from "../Meta/MetaCanonical";
import { useTitle } from "../../hooks/useTitle";

function GameListPage() {
    const sockets = useContext(WebsocketContext);
    const runtimeContext = useContext(AppRuntimeSettingsContext);
    const auth = useContext(AuthContext).auth;

    const [gameList, setGameList] = useState<GameListGame[]>([]);
    const [selectedGame, setSelectedGame] = useState<GameListGame | null>(null);
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    const { filterSettings, setFilterSettings, disabledFilters } = useGameListFilterSetings();

    const debouncedFilterSettings = useDebounce(filterSettings, 100);

    const filtredGameList = useGameListFilter({
        gameList,
        filters: debouncedFilterSettings,
    });

    useGameListSubscribe({
        ghostSocket: sockets.ghostSocket,
        isGameListLocked: runtimeContext.gameList.locked,
        onGameList: setGameList,
        filters: debouncedFilterSettings,
        ignoreFocusCheck: false,
    });

    const displayedGameList = useDisplayedGameList({
        gameList: filtredGameList,
        filters: debouncedFilterSettings,
    });

    const connectorCache = useContext(CacheContext).cachedConnectorIds;

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    useTitle(lang.gameListPageTitle);

    useEffect(() => {
        const uncachedConnectorIds = gameList
            .map((i) => {
                return i.creatorID;
            })
            .filter((i) => {
                return !connectorCache[i];
            });

        if (uncachedConnectorIds.length > 0) {
            sockets.ghostSocket.send(
                new ClientResolveConnectorIdsConverter().assembly({
                    connectorIds: uncachedConnectorIds,
                })
            );
        }
    }, [gameList, connectorCache, sockets.ghostSocket]);

    return (
        <Container className="game-list">
            <MetaDescription description={lang.gameListPageDescription} />
            <MetaCanonical hostPath="/" />
            <Grid columns="equal" stackable>
                <Grid.Column width={13} className="game-list-column">
                    <Input
                        onChange={(event, data) => setFilterSettings({ ...filterSettings, quickFilter: data.value })}
                        value={filterSettings.quickFilter}
                        style={{ width: "50%" }}
                        placeholder={lang.gameListPageQuickFilterPlaceholder}
                    />
                    {auth.accessMask.hasAccess(AccessMaskBit.GAME_CREATE) && (
                        <Button as={Link} to="/create" floated="right" basic icon="plus" color="green" size="large" />
                    )}
                    <Button floated="right" basic icon="copy" color={runtimeContext.linkCopyMode.copy ? "green" : undefined} size="large" onClick={() => {
                        runtimeContext.linkCopyMode.setCopy((copy) => !copy);
                    }} />

                    <Button
                        basic
                        icon="filter"
                        floated="right"
                        size="large"
                        onClick={() => {
                            setFilterModalOpen(true);
                        }}
                    />
                    {sockets.connectorSocket.isConnected() && (
                        <Message error>
                            <Message.Header>Мы обновили коннектор</Message.Header>
                            <Message.Content>
                                Мы заметили, что у вас открыт старый коннектор. Обновите его по этой{" "}
                                <NavLink to="/wiki/irina-help/how-to-play">инструкции</NavLink>
                            </Message.Content>
                        </Message>
                    )}

                    <GameList
                        gameList={displayedGameList}
                        selectedGame={selectedGame}
                        setSelectedGame={setSelectedGame}
                    ></GameList>
                </Grid.Column>
                <Grid.Column width="three" className="online-stats-column">
                    <NavLink to="/wiki/irina-help/how-to-play">
                        <Button className="how-btn" basic color="green" size="large">
                            {lang.gameListPageHowToPlay}
                        </Button>
                    </NavLink>

                    {selectedGame ? (
                        <MapInfo mapId={selectedGame.mapId}></MapInfo>
                    ) : (
                        <OnlineStats gameList={gameList}></OnlineStats>
                    )}
                </Grid.Column>
            </Grid>
            <GameListFiltersModal
                open={filterModalOpen}
                onClose={() => {
                    setFilterModalOpen(false);
                }}
                disabledFilters={disabledFilters}
                filterSettings={filterSettings}
                onFilterChange={setFilterSettings}
            />
        </Container>
    );
}

export default GameListPage;
