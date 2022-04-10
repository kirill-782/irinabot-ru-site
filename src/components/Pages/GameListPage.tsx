import { useContext, useEffect, useMemo, useState } from "react";
import { Button, Container, Dropdown, Grid, Input } from "semantic-ui-react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../../context";
import { ClientGameListConverter } from "../../models/websocket/ClientGameList";
import { DEFAULT_GAME_LIST } from "../../models/websocket/HeaderConstants";
import {
  GameListGame,
  ServerGameList,
} from "../../models/websocket/ServerGameList";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import GameList from "../GameList/GameList";
import OnlineStats from "../GameList/OnlineStats";
import {
  allSlotsSort,
  defaultSort,
  freeSlotsSort,
  gameTypeSort,
  playersOccupiedSlot,
} from "../../utils/GameListSortMethods";

function GameListPage() {
  const sockets = useContext(WebsocketContext);
  const runtimeContext = useContext(AppRuntimeSettingsContext);

  const [gameList, setGameList] = useState<GameListGame[]>([]);
  const [quicFilter, setQuicFilter] = useState<string>("");
  const [orderFunction, setOrderFunction] = useState<any>("");
  const [reverseOrder, setReverseOrder] = useState(false);

  const getOrderFunction = (value) => {
    switch (value) {
      case "freeSlots":
        return freeSlotsSort;
      case "allSlots":
        return allSlotsSort;
      case "playerSlots":
        return playersOccupiedSlot;
      default:
        return defaultSort;
    }
  };

  const filtredGameList = useMemo(() => {
    let filtredGames = gameList.filter((game) => {
      if (quicFilter.length == 0) return true;

      if (game.name.toLocaleLowerCase().search(quicFilter.toLowerCase()) >= 0)
        return true;

      const players = game.players.filter((player) => {
        if (player.name.length == 0) return false;
        if (
          player.name.toLocaleLowerCase().search(quicFilter.toLowerCase()) >= 0
        )
          return true;
        return false;
      });

      if (players.length > 0) return true;

      return false;
    });

    return filtredGames.sort((a, b) => {
      return (
        gameTypeSort(a, b) ||
        getOrderFunction(orderFunction)(a, b) * (reverseOrder ? -1 : 1)
      );
    });
  }, [gameList, quicFilter, orderFunction, reverseOrder]);

  // Subscribe component to socket events and gameList

  useEffect(() => {
    let intervalId;

    const sendGameListRequest = () => {
      if (sockets.ghostSocket.isConnected()) {
        let clientGameListConverter = new ClientGameListConverter();
        sockets.ghostSocket.send(
          clientGameListConverter.assembly({ filters: 0xffffffff })
        );
      }
    };

    const trySendGameList = () => {
      if (document.hasFocus() && !runtimeContext.gameList.locked)
        sendGameListRequest();
      else intervalId = setTimeout(trySendGameList, 500);
    };

    const onGameList = (event: GHostPackageEvent) => {
      if (event.detail.package.type == DEFAULT_GAME_LIST) {
        const gameList: ServerGameList = event.detail.package as ServerGameList;
        setGameList(gameList.games);

        clearTimeout(intervalId);
        intervalId = setTimeout(trySendGameList, 3000);
      }
    };

    if (sockets.ghostSocket.isConnected()) {
      let clientGameListConverter = new ClientGameListConverter();
      sockets.ghostSocket.send(
        clientGameListConverter.assembly({ filters: 0xffffffff })
      );
    }

    const onConnectOpen = () => sendGameListRequest();

    const onConnectClose = () => {
      clearTimeout(intervalId);
      intervalId = null;
    };

    sockets.ghostSocket.addEventListener("package", onGameList);
    sockets.ghostSocket.addEventListener("open", onConnectOpen);
    sockets.ghostSocket.addEventListener("close", onConnectClose);

    return () => {
      clearInterval(intervalId);

      sockets.ghostSocket.removeEventListener("package", onGameList);
      sockets.ghostSocket.removeEventListener("open", onConnectOpen);
      sockets.ghostSocket.removeEventListener("close", onConnectClose);
    };
  }, [sockets.ghostSocket, runtimeContext.gameList]);

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
                onChange={(event, data) => setOrderFunction(data.value)}
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
          <div>
            <GameList gameList={filtredGameList}></GameList>
          </div>
        </Grid.Column>
        <Grid.Column width="four">
          <OnlineStats gameList={gameList}></OnlineStats>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default GameListPage;
