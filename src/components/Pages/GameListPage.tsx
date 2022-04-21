import React, { useContext, useState } from "react";
import {
  Button,
  Container,
  Grid,
  Input,
} from "semantic-ui-react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../../context";
import { GameListGame } from "../../models/websocket/ServerGameList";
import GameList from "../GameList/GameList";
import OnlineStats from "../GameList/OnlineStats";

import { useGameListSubscribe } from "../../hooks/useGameListSubscribe";
import { FilterSettings, useGameListFilter } from "../../hooks/useGameListFilter";
import GameListFilter from "../GameList/GameListFilter";

function GameListPage() {
  const sockets = useContext(WebsocketContext);
  const runtimeContext = useContext(AppRuntimeSettingsContext);

  const [gameList, setGameList] = useState<GameListGame[]>([]);
  const [quicFilter, setQuicFilter] = useState<string>("");

  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    noLoadStarted: true,
    onlySelfGames: false,
    gameType: 0,
    orderBy: "default",
    reverseOrder: false,
    minPlayers: 1,
    maxPlayers: 24,
    minFreeSlots: 1,
    maxFreeSlots: 24,
    minSlots: 1,
    maxSlots: 24,
  });

  useGameListSubscribe({
    ghostSocket: sockets.ghostSocket,
    isGameListLocked: runtimeContext.gameList.locked,
    onGameList: setGameList,
  });

  const filtredGameList = useGameListFilter({
    gameList,
    quicFilter,
    filters: filterSettings
  });

  return (
    <Container>
      <Grid columns="equal" stackable>
        <Grid.Column width="three" />
        <Grid.Column width="ten">
          <Input
            onChange={(event, data) => setQuicFilter(data.value)}
            value={quicFilter}
            style={{ width: "50%" }}
            placeholder="Быстрый фильтр"
          />
          <Button floated="right" basic icon="bell" />
          <Button floated="right" basic icon="filter" />
        </Grid.Column>
      </Grid>

      <Grid columns="equal" stackable>
        <Grid.Column width="three">
          <GameListFilter
            filterSettings={filterSettings}
            onFilterChange={(value) => {
              setFilterSettings(value);
            }}
          />
        </Grid.Column>
        <Grid.Column width="ten">
          <GameList gameList={filtredGameList}></GameList>
        </Grid.Column>
        <Grid.Column width="three">
          <OnlineStats gameList={gameList}></OnlineStats>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default GameListPage;
