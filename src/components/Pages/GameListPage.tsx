import React, { useContext, useMemo, useState } from "react";
import { Button, Container, Grid, Input } from "semantic-ui-react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../../context";
import { GameListGame } from "../../models/websocket/ServerGameList";
import GameList from "../GameList";
import OnlineStats from "../GameList/OnlineStats";

import { useGameListSubscribe } from "../../hooks/useGameListSubscribe";
import { useGameListFilterSetings } from "../../hooks/useGameListFilterSetings";
import { useGameListFilter } from "../../hooks/useGameListFilter";
import GameListFilter from "../GameList/GameListFilter";
import { useDebounce } from "./../../hooks/useDebounce";

import "../GameList/GameList.scss";
import MapInfo from "../GameList/MapInfo";
import { Link } from "react-router-dom";

function GameListPage() {
  const sockets = useContext(WebsocketContext);
  const runtimeContext = useContext(AppRuntimeSettingsContext);

  const [gameList, setGameList] = useState<GameListGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameListGame | null>(null);

  const { filterSettings, setFilterSettings, disabledFilters } =
    useGameListFilterSetings();

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

  return (
    <Container className="game-list">
      <Grid columns="equal" stackable>
        <Grid.Column width="three">
          <GameListFilter
            disabledFilters={disabledFilters}
            filterSettings={filterSettings}
            onFilterChange={setFilterSettings}
          />
        </Grid.Column>
        <Grid.Column width="ten" className="game-list-column">
          <Input
            onChange={(event, data) =>
              setFilterSettings({ ...filterSettings, quicFilter: data.value })
            }
            value={filterSettings.quicFilter}
            style={{ width: "50%" }}
            placeholder="Быстрый фильтр"
          />
          <Button
            as={Link}
            to="/create"
            floated="right"
            basic
            icon="plus"
            color="green"
            size="large"
          />
          <GameList
            gameList={filtredGameList}
            selectedGame={selectedGame}
            setSelectedGame={setSelectedGame}
          ></GameList>
        </Grid.Column>
        <Grid.Column width="three" className="online-stats-column">
          <Button className="how-btn" basic color="green" size="large">
            Как играть
          </Button>
          {selectedGame ? (
            <MapInfo mapId={selectedGame.mapId}></MapInfo>
          ) : (
            <OnlineStats gameList={gameList}></OnlineStats>
          )}
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default GameListPage;
