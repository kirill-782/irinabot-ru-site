import React, { useContext } from "react";
import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Checkbox,
  Container,
  Form,
  Grid,
  Header,
  Message,
} from "semantic-ui-react";
import { SITE_TITLE } from "../../config/ApplicationConfig";
import {
  AppRuntimeSettingsContext,
  MapContext,
  WebsocketContext,
} from "../../context";
import { useGameListSubscribe } from "../../hooks/useGameListSubscribe";
import { useSearchMaps } from "../../hooks/useSearchMaps";
import { useVisibility } from "../../hooks/useVisibility";
import { SearchFilters, SearchOrder } from "../../models/rest/SearchFilters";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { MapCard } from "../MapListPage/MapCard";
import { Filter, MapFilters } from "../MapListPage/MapFilters";
import MapStats from "../MapPage/MapStats";
import GameJoinButton from "../MapPage/GameJoinButton";

import MetaDescription from "../Meta/MetaDescription";
import { isNoFilters } from "./../../hooks/useSearchMaps";
import "./MapListPage.scss";

const defaultFilters: Filter = {
  verify: false,
  taggedOnly: false,
  minPlayers: 1,
  maxPlayers: 24,
  category: 0,
  owner: "",
  favoritedOnly: false,
};

const filtersUrlParams = [
  "category",
  "verify",
  "taggedOnly",
  "minPlayers",
  "maxPlayers",
  "sortBy",
  "orderBy",
  "owner",
  "favorite",
];

const defaultFilter = {
  verify: true,
};

const unique = (value, index, self) => {
  return self.indexOf(value) === index;
};

function MapListPage() {
  const [searchOptions, setSearchOptions] = useState<
    [SearchFilters | null, SearchOrder | null]
  >([null, null]);

  const [searchValue, setSearchValue] = useState("");
  const [mapIds, setMapsId] = useState("");

  const sockets = useContext(WebsocketContext);
  const runtimeContext = useContext(AppRuntimeSettingsContext);
  const [gameList, setGameList] = useState<GameListGame[]>([]);

  useGameListSubscribe({
    ghostSocket: sockets.ghostSocket,
    isGameListLocked: runtimeContext.gameList.locked,
    onGameList: setGameList,
    ignoreFocusCheck: false,
  });

  const [loadButton, setLoadButton] = useState<HTMLButtonElement | null>(null);

  const isVisible = useVisibility(loadButton, { rootMargin: "100px" });
  const [disableFilters, setDisableFilters] = useState<boolean>(false);

  const requestFilter = useMemo(() => {
    if (mapIds || searchValue || !isNoFilters(searchOptions[0])) {
      return {
        mapIds: mapIds || undefined,
        ...searchOptions[0],
      };
    }

    return defaultFilter;
  }, [searchValue, searchOptions[0], defaultFilter, mapIds]); 

  const [searchedMaps, isFull, isLoading, errorMessage, loadNextPage] =
    useSearchMaps(requestFilter, searchOptions[1], searchValue);

  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    window.document.title = `Карты Warcraft III | ${SITE_TITLE}`;
  }, []);

  useEffect(() => {
    if (searchOptions[0] || searchOptions[1]) {
      const urlParams = new URLSearchParams(loc.search);

      if (searchOptions[0]) {
        Object.entries(searchOptions[0]).forEach((entry) => {
          if (entry[1]) urlParams.set(entry[0], entry[1].toString());
          else urlParams.delete(entry[0]);
        });
      }

      if (searchOptions[1]) {
        Object.entries(searchOptions[1]).forEach((entry) => {
          if (entry[1]) urlParams.set(entry[0], entry[1].toString());
          else urlParams.delete(entry[0]);
        });
      }

      navigate("?" + urlParams.toString());
    } else {
      const urlParams = new URLSearchParams(loc.search);

      filtersUrlParams.forEach((i) => {
        urlParams.delete(i);
      });

      navigate("?" + urlParams.toString(), { state: {} });
    }
  }, [searchOptions]);

  useEffect(() => {
    const urlParams = new URLSearchParams(loc.search);

    setDisableFilters(urlParams.has("disableFilters"));

    let urlFilters: SearchFilters = {};
    let urlOrder: SearchOrder = {};

    urlParams.forEach((i, k) => {
      switch (k) {
        case "category":
          urlFilters.category = parseInt(i);

          if (isNaN(urlFilters.category)) urlFilters.category = undefined;

          break;
        case "verify":
          if (i === "true") urlFilters.verify = true;

          break;
        case "taggedOnly":
          if (i === "true") urlFilters.taggedOnly = true;

          break;

        case "favorite":
          if (i === "true") urlFilters.favorite = true;

          break;

        case "minPlayers":
          urlFilters.minPlayers = parseInt(i);

          if (isNaN(urlFilters.minPlayers)) urlFilters.minPlayers = undefined;

          break;
        case "maxPlayers":
          urlFilters.maxPlayers = parseInt(i);

          if (isNaN(urlFilters.maxPlayers)) urlFilters.maxPlayers = undefined;

          break;
        case "sortBy":
          urlOrder.sortBy = i;

          break;
        case "orderBy":
          urlOrder.orderBy = i;

          break;
        case "owner":
          urlFilters.owner = i;

          break;
      }
    });

    if (
      !Object.entries(urlFilters).length &&
      !Object.entries(urlOrder).length
    ) {
    } else if (!searchOptions[0] && !searchOptions[1])
      setSearchOptions([urlFilters, urlOrder]);
    else {
      let equals = true;

      if (searchOptions[0]) {
        Object.keys(searchOptions[0]).forEach((i) => {
          if (!searchOptions[0]) return;
          if (searchOptions[0][i] !== urlFilters[i]) equals = false;
        });
      }

      if (searchOptions[1]) {
        Object.keys(searchOptions[1]).forEach((i) => {
          if (!searchOptions[1]) return;
          if (searchOptions[1][i] !== urlOrder[i]) equals = false;
        });
      }

      if (!equals) setSearchOptions([urlFilters, urlOrder]);
    }
  }, [loc.search]);

  useEffect(() => {
    if (isVisible) loadNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const onLobbyGamesClick = (checked?: boolean) => {
    if (checked) {
      setMapsId(
        gameList
          .map((i) => i.mapId)
          .filter(unique)
          .join(",")
      );
    } else setMapsId("");
  };

  return (
    <Container className="map-list-page">
      <MetaDescription description="Просмотреть список загруженных на бота карт." />
      <Form>
        <Grid columns="equal" stackable centered>
          {!disableFilters && (
            <Grid.Column width={3} style={{ position: "sticky" }}>
              <Header size="small">Фильтры</Header>
              <MapFilters
                onFitlerChange={setSearchOptions}
                value={searchOptions}
                autoCommit
                defaultFilters={defaultFilters}
              />
              <Checkbox
                label="Ограничить поиск картами из списка с играми"
                checked={mapIds.length > 0}
                onChange={(_, data) => {
                  onLobbyGamesClick(data.checked);
                }}
              />
            </Grid.Column>
          )}
          <Grid.Column width={13}>
            <Header>Список карт</Header>
            <Grid.Row className="map-list-page-search-field">
              <Form.Input
                fluid
                onChange={(_, data) => {
                  setSearchValue(data.value);
                }}
                loading={isLoading}
                value={searchValue}
                error={!!errorMessage}
                label="Поиск карты"
                placeholder="Введите часть названия карты..."
              />
            </Grid.Row>
            {searchedMaps &&
              searchedMaps.map((map, key) => {
                return (
                  <React.Fragment key={map.id}>
                    <MapCard {...map} />
                    <Grid padded="vertically">
                      <Grid.Row className="player-stats">
                        <MapStats
                          className="centred"
                          gameList={gameList}
                          mapId={map.id || 0}
                        />
                        <GameJoinButton
                          gameList={gameList}
                          mapId={map.id || 0}
                        />
                      </Grid.Row>
                    </Grid>
                  </React.Fragment>
                );
              })}
            {searchedMaps && !isFull && (
              <Grid textAlign="center">
                <button
                  onClick={() => loadNextPage()}
                  disabled={isLoading}
                  className="ui floated button"
                  ref={(el: HTMLButtonElement) => {
                    setLoadButton(el);
                  }}
                >
                  {isLoading ? "Загрузка. . ." : "Загрузить еще"}
                </button>
              </Grid>
            )}
          </Grid.Column>
        </Grid>
      </Form>
    </Container>
  );
}

export default MapListPage;
