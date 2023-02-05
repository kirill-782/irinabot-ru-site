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
  CacheContext,
  MapContext,
  WebsocketContext,
} from "../../context";
import { useGameListSubscribe } from "../../hooks/useGameListSubscribe";
import { useQueryState } from "../../hooks/useQueryState";
import { useSearchMaps } from "../../hooks/useSearchMaps";
import { useVisibility } from "../../hooks/useVisibility";
import { useSearchFiltersQuerySync } from "../../hooks/useSearchFiltersQuerySync";
import { SearchFilters, SearchOrder } from "../../models/rest/SearchFilters";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { MapCard } from "../MapListPage/MapCard";
import { Filter, MapFilters } from "../MapListPage/MapFilters";
import MapStats from "../MapPage/MapStats";
import GameJoinButton from "../MapPage/GameJoinButton";

import MetaDescription from "../Meta/MetaDescription";
import { isNoFilters } from "./../../hooks/useSearchMaps";
import "./MapListPage.scss";
import FilterDescription from "./../MapListPage/FilterDescription";

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

  useSearchFiltersQuerySync(searchOptions, setSearchOptions);

  const [searchValue, setSearchValue] = useState("");
  const [mapIds, setMapsId] = useState("");

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

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
  const [disableFilters, setDisableFilters] = useQueryState("disableFilters");

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

  useEffect(() => {
    window.document.title = `${t("page.map.list.maps")} | ${SITE_TITLE}`;
  }, []);

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
      <MetaDescription description={t("page.map.list.maps") + "."} />
      <Form>
        <Grid columns="equal" stackable centered>
          {disableFilters !== "true" && (
            <Grid.Column width={3} style={{ position: "sticky" }}>
              <Header size="small">{t("page.map.list.filters")}</Header>
              <MapFilters
                onFitlerChange={setSearchOptions}
                value={searchOptions}
                defaultFilters={defaultFilters}
              />
              <Checkbox
                label={t("page.map.list.limitedSearching")}
                checked={mapIds.length > 0}
                onChange={(_, data) => {
                  onLobbyGamesClick(data.checked);
                }}
              />
            </Grid.Column>
          )}
          <Grid.Column width={13}>
            {disableFilters === "true" && (
              <FilterDescription filters={searchOptions} />
            )}
            <Header>{t("page.map.list.list")}</Header>
            <Grid.Row className="map-list-page-search-field">
              <Form.Input
                fluid
                onChange={(_, data) => {
                  setSearchValue(data.value);
                }}
                loading={isLoading}
                value={searchValue}
                error={!!errorMessage}
                label={t("page.map.list.searching")}
                placeholder={t("page.map.list.inputName")}
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
                  {isLoading
                    ? t("page.map.list.loading")
                    : t("page.map.list.loadYet")}
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
