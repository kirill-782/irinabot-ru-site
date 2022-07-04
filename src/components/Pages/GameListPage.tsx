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

import "./GameListPage.scss";

function GameListPage() {
  const sockets = useContext(WebsocketContext);
  const runtimeContext = useContext(AppRuntimeSettingsContext);

  const [gameList, setGameList] = useState<GameListGame[]>([]);

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

  // Cached render
  const gameListComponent = useMemo(() => {
    return <GameList gameList={filtredGameList}></GameList>;
  }, [filtredGameList]);

  return (
    <Container className="game-list">
      <Grid columns="equal" stackable>
        <Grid.Column width="three" />
        <Grid.Column width="ten">
          <Input
            onChange={(event, data) =>
              setFilterSettings({ ...filterSettings, quicFilter: data.value })
            }
            value={filterSettings.quicFilter}
            style={{ width: "50%" }}
            placeholder="Быстрый фильтр"
          />
          <Button floated="right" basic icon="bell" size="large" />
        </Grid.Column>
      </Grid>

      <Grid columns="equal" stackable>
        <Grid.Column width="three">
          <GameListFilter
            disabledFilters={disabledFilters}
            filterSettings={filterSettings}
            onFilterChange={setFilterSettings}
          />
        </Grid.Column>
        <Grid.Column width="ten" className="game-list-column">
          {gameListComponent}
        </Grid.Column>
        <Grid.Column width="three" className="online-stats-column">
          <OnlineStats gameList={gameList}></OnlineStats>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default GameListPage;
