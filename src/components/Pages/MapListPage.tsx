import React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container, Form, Grid, Header, Message, Tab } from "semantic-ui-react";
import { SITE_TITLE } from "../../config/ApplicationConfig";
import { useSearchMaps } from "../../hooks/useSearchMaps";
import { useVisibility } from "../../hooks/useVisibility";
import { SearchFilters } from "../../models/rest/SearchFilters";
import ConnectorId from "../ConnectorId";
import { GameCard } from "../CreateGame/GameCard";
import { Filter, MapFilters } from "../MapListPage/MapFilters";
import MetaDescription from "../Meta/MetaDescription";

const defaultFilters: Filter = {
  verify: false,
  taggedOnly: false,
  minPlayers: 1,
  maxPlayers: 24,
  sortBy: "default",
  orderBy: "default",
  category: 0,
  owner: "",
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
];

const isNoFilters = (filters: SearchFilters | null) => {
  if (!filters || !Object.keys(filters).length) return true;

  let found = false;

  Object.keys(filters).forEach((i) => {
    if (filters[i] !== undefined) found = true;
  });

  return !found;
};

const defaultFilter = {
  verify: true,
};

function MapListPage() {
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [loadButton, setLoadButton] = useState<HTMLButtonElement | null>(null);

  let searchFilters = filters;

  if (isNoFilters(filters)) searchFilters = defaultFilter;

  const [searchedMaps, isFull, isLoading, errorMessage, loadNextPage] =
    useSearchMaps(searchFilters, "");

  const isVisible = useVisibility(loadButton, { rootMargin: "100px" });

  const [disableFilters, setDisableFilters] = useState<boolean>(false);

  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    window.document.title = `Список карт - ${SITE_TITLE}`;
  }, []);

  useEffect(() => {
    if (filters) {
      const urlParams = new URLSearchParams(loc.search);

      Object.entries(filters).forEach((entry) => {
        if (entry[1]) urlParams.set(entry[0], entry[1].toString());
        else urlParams.delete(entry[0]);
      });

      navigate("?" + urlParams.toString());
    } else {
      const urlParams = new URLSearchParams(loc.search);

      filtersUrlParams.forEach((i) => {
        urlParams.delete(i);
      });

      navigate("?" + urlParams.toString(), {state: {}});
    }
  }, [filters]);

  useEffect(() => {
    const urlParams = new URLSearchParams(loc.search);

    setDisableFilters(urlParams.has("disableFilters"));

    let urlFilters: SearchFilters = {};

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
        case "minPlayers":
          urlFilters.minPlayers = parseInt(i);

          if (isNaN(urlFilters.minPlayers)) urlFilters.minPlayers = undefined;

          break;
        case "maxPlayers":
          urlFilters.maxPlayers = parseInt(i);

          if (isNaN(urlFilters.maxPlayers)) urlFilters.maxPlayers = undefined;

          break;
        case "sortBy":
          urlFilters.sortBy = i;

          break;
        case "orderBy":
          urlFilters.orderBy = i;

          break;
        case "owner":
          urlFilters.owner = i;

          break;
      }
    });

    if (!Object.entries(urlFilters).length) {
    } else if (!filters) setFilters(urlFilters);
    else {
      let equals = true;

      Object.keys(filters).forEach((i) => {
        if (filters[i] !== urlFilters[i]) equals = false;
      });

      if (!equals) setFilters({ ...filters, ...urlFilters });
    }
  }, [loc.search]);

  useEffect(() => {
    if (isVisible) loadNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return (
    <Container>
      <MetaDescription description="Просмотреть список загруженных на бота карт." />
      <Form>
        <Grid columns="equal" stackable centered>
          {!disableFilters && (
            <Grid.Column width={3}>
              <Header size="small">Фильтры</Header>
              <MapFilters
                onFitlerChange={setFilters}
                value={filters}
                autoCommit
                defaultFilters={defaultFilters}
              />
            </Grid.Column>
          )}
          <Grid.Column width={12}>
            <Header>Список карт</Header>
            <Message>
              Карты, загруженные пользователем <ConnectorId id={1} />
            </Message>
            {searchedMaps &&
              searchedMaps.map((map, key) => (
                <div key={map.id} >
                  <Link to={`/maps/${map.id}`}>{map.mapInfo?.name}</Link>
                </div>
              ))}

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
