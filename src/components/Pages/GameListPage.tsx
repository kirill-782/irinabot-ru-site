import { useContext, useEffect, useState } from "react";
import { Container, Grid } from "semantic-ui-react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../../context";
import { ClientGameListConverter } from "../../models/websocket/ClientGameList";
import { DEFAULT_GAME_LIST } from "../../models/websocket/HeaderConstants";
import { ServerGameList } from "../../models/websocket/ServerGameList";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import GameList from "../GameList/GameList";
import OnlineStats from "../GameList/OnlineStats";

function GameListPage() {
  const sockets = useContext(WebsocketContext);
  const runtimeContext = useContext(AppRuntimeSettingsContext);

  const [gameList, setGameList] = useState([]);

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
        intervalId = setTimeout(trySendGameList, 500);
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

  return (
    <Container>
      <Grid stackable className="equal width">
        <Grid.Column width="twelve">
          <GameList gameList={gameList}></GameList>
        </Grid.Column>
        <Grid.Column width="four">
          <OnlineStats gameList={gameList}></OnlineStats>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default GameListPage;
