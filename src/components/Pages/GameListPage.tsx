import React, { useContext, useState } from "react";
import { Button, Container, Dropdown, Grid, Input } from "semantic-ui-react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../../context";
import { GameListGame } from "../../models/websocket/ServerGameList";
import GameList from "../GameList/GameList";
import OnlineStats from "../GameList/OnlineStats";

import { useGameListSubscribe } from "../../hooks/useGameListSubscribe";
import { useGameListFilter } from "../../hooks/useGameListFilter";

function GameListPage() {
  const sockets = useContext(WebsocketContext);
  const runtimeContext = useContext(AppRuntimeSettingsContext);

  const [gameList, setGameList] = useState<GameListGame[]>([]);
  const [quicFilter, setQuicFilter] = useState<string>("");
  const [orderName, setOrderName] = useState<any>("");
  const [reverseOrder, setReverseOrder] = useState(false);

  useGameListSubscribe({
    ghostSocket: sockets.ghostSocket,
    isGameListLocked: runtimeContext.gameList.locked,
    onGameList: setGameList,
  });

  const filtredGameList = useGameListFilter({
    gameList,
    quicFilter,
    reverseOrder,
    orderName,
  });

  const options = [
    {
      key: "default",
      text: "По умолчанию",
      value: "default",
    },
    {
      key: "freeSlots",
      text: "Свободно слотов",
      value: "freeSlots",
    },
    {
      key: "allSlots",
      text: "Всего слотов",
      value: "allSlots",
    },
    {
      key: "playerSlots",
      text: "Игроков в игре",
      value: "playerSlots",
    },
  ];

  return (
    <Container>
      <Grid columns="equal" stackable>
        <Grid.Column width="twelve">
          <Input
            onChange={(event, data) => setQuicFilter(data.value)}
            value={quicFilter}
            style={{ width: "50%" }}
            placeholder="Быстрый фильтр"
            action={
              <Dropdown
                onChange={(event, data) => setOrderName(data.value)}
                button
                basic
                floating
                options={options}
                defaultValue="default"
              />
            }
          />
          <Button floated="right" basic icon="bell" />
          <Button floated="right" basic icon="filter" />
          <Button
            floated="right"
            color={reverseOrder ? "green" : null}
            basic
            icon="exchange"
            onClick={() => setReverseOrder((reverseOrder) => !reverseOrder)}
          />
        </Grid.Column>
      </Grid>

      <Grid columns="equal" stackable>
        <Grid.Column width="twelve">
          <GameList gameList={filtredGameList}></GameList>
        </Grid.Column>
        <Grid.Column width="four">
          <OnlineStats gameList={gameList}></OnlineStats>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default GameListPage;
