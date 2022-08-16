import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Loader,
  Message,
  Image,
  Header,
  Label,
  Button,
} from "semantic-ui-react";
import { SITE_TITLE } from "../../config/ApplicationConfig";
import { RestContext, WebsocketContext } from "../../context";
import { Category } from "../../models/rest/Category";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import { Map } from "../../models/rest/Map";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import MapHeader from "../MapPage/MapHeader";
import MapSlots from "../MapPage/MapSlots";
import { escapeWC3Tags } from "./../../utils/WC3TestUtils";
import WarcraftIIIText from "./../WarcraftIIIText";
import MapFooter from "./../MapPage/MapFooter";
import MapDescription from "../MapPage/MapDescription";
import MapFlags from "./../MapPage/MapFlags";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { useGameListSubscribe } from "../../hooks/useGameListSubscribe";
import MapStats from "../MapPage/MapStats";

function MapPage() {
  const { id } = useParams();
  const mapsApi = useContext(RestContext).mapsApi;
  const [mapData, setMapData] = useState<Map | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [config, setConfig] = useState<ConfigInfo | undefined | null>();

  const sockets = useContext(WebsocketContext);
  const [gameList, setGameList] = useState<GameListGame[]>([]);

  useGameListSubscribe({
    ghostSocket: sockets.ghostSocket,
    isGameListLocked: false,
    onGameList: setGameList,
    ignoreFocusCheck: false,
  });

  useEffect(() => {
    window.document.title = `${escapeWC3Tags(
      mapData?.mapInfo?.name || ""
    )} - ${SITE_TITLE}`;

    const description = document.createElement("meta");
    description.setAttribute(
      "description",
      escapeWC3Tags(mapData?.mapInfo?.description || "")
    );

    document.head.appendChild(description);

    return () => {
      document.head.removeChild(description);
    };
  }, [mapData]);

  useEffect(() => {
    const abort = new AbortController();

    setLoading(true);

    mapsApi
      .getMapInfo(parseInt(id || "0"), { signal: abort.signal })
      .then((map) => {
        setMapData(map);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        if (e.message === "canceled") return;
        setErrorMessage(convertErrorResponseToString(e));
      });

    return () => {
      setLoading(false);
      setConfig(undefined);
      setErrorMessage("");
      setMapData(null);
      abort.abort();
    };
  }, [id]);

  useEffect(() => {
    const abort = new AbortController();

    if (mapData) {
      const readyConfigs =
        mapData.configs?.filter((config) => {
          return config.status === 1;
        }) || [];

      if (readyConfigs.length > 0) {
        mapsApi
          .getDefaultMapConfig(
            parseInt(id || "0"),
            readyConfigs[0].version || "",
            { signal: abort.signal }
          )
          .then((config) => {
            setConfig(config);
          });
      } else setConfig(null);
    }

    return () => {
      abort.abort();
    };
  }, [id, mapData]);

  return (
    <Container>
      {errorMessage && (
        <Message error>
          <p>{errorMessage}</p>
        </Message>
      )}
      {isLoading && (
        <Loader active size="big">
          Загрузка
        </Loader>
      )}
      {mapData && (
        <Grid columns="equal" stackable>
          <Grid.Row>
            <MapHeader {...mapData} />
          </Grid.Row>
          {mapData?.additionalFlags?.mapDescription && (
            <MapDescription
              desctiption={mapData?.additionalFlags?.mapDescription}
            />
          )}
          <Grid.Row>
            <MapFlags {...mapData.additionalFlags} />
          </Grid.Row>
          <MapFooter {...mapData} gameList={gameList} />
          <Grid.Row>
            {config === undefined && (
              <Loader size="big" active>
                Конфиг загружается
              </Loader>
            )}
            {config === null && (
              <Message style={{ width: "100%" }} info>
                Слоты не парсились
              </Message>
            )}
            {config?.config && (
              <MapSlots
                slots={config?.config.playableSlots}
                options={config?.config.options}
              ></MapSlots>
            )}
          </Grid.Row>
        </Grid>
      )}
    </Container>
  );
}


export default MapPage;