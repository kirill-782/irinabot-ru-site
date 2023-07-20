import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Form, Grid, Header } from "semantic-ui-react";
import { SearchFilters, SearchOrder } from "../../models/rest/SearchFilters";
import { MapFilters } from "../MapListPage/MapFilters";
import { useDefaultMaps } from "../../hooks/useDefaultMaps";
import { useSearchMaps } from "../../hooks/useSearchMaps";
import { useVisibility } from "../../hooks/useVisibility";
import { MapCard } from "../MapListPage/MapCard";
import { SessionStorage } from "../../services/SessionStorage";

import "./MapSelectTab.scss";
import { Link, useLocation } from "react-router-dom";
import { AppRuntimeSettingsContext } from "../../context";

const SESSION_KEY = "mapSelectTab";

interface SesstionSaveOptions {
  searchOptions: [SearchFilters | null, SearchOrder | null];
  searchValue: string;
}

function MapSelectTab() {
  const [searchOptions, setSearchOptions] = useState<
    [SearchFilters | null, SearchOrder | null]
  >([null, null]);
  const [searchValue, setSearchValue] = useState("");

  const defalutMaps = useDefaultMaps();

  const [searchedMaps, isFull, isLoading, errorMessage, loadNextPage] =
    useSearchMaps(searchOptions[0], searchOptions[1], searchValue);

  const [loadButton, setLoadButton] = useState<HTMLButtonElement | null>(null);

  const isVisible = useVisibility(loadButton, { rootMargin: "100px" });

  const location = useLocation();

  const storageState = useRef<SesstionSaveOptions>({
    searchOptions,
    searchValue,
  });

  storageState.current = {
    searchOptions,
    searchValue,
  };

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  useEffect(() => {
    const savedState = SessionStorage.get<SesstionSaveOptions>(
      location.key,
      SESSION_KEY
    );

    if (savedState) {
      setSearchOptions(savedState.searchOptions);
      setSearchValue(savedState.searchValue);
    }

    return () => {
      SessionStorage.save(location.key, SESSION_KEY, storageState.current);
    };
  }, [location.hash]);

  useEffect(() => {
    loadNextPage();
  }, [isVisible]);

  const renderMapList = searchedMaps || defalutMaps;

  return (
    <Grid columns="equal" stackable className="map-select-tab">
      <Grid.Column width={3}>
        <Header size="small">{lang.filters}</Header>
        <Form className="filter-form">
          <MapFilters
            value={searchOptions}
            autoCommit
            onFitlerChange={setSearchOptions}
          />
        </Form>
      </Grid.Column>
      <Grid.Column>
        <Grid.Row>
          <Form>
            <Form.Input
              fluid
              onChange={(_, data) => {
                setSearchValue(data.value);
              }}
              loading={isLoading}
              value={searchValue}
              error={!!errorMessage}
              label={lang.mapSearch}
              placeholder={lang.mapSearchPlaceholder}
            />
          </Form>
        </Grid.Row>
        <Grid.Row className="map-list">
          {renderMapList.map((map, key) => (
            <MapCard
              key={key}
              {...map}
              selectElement={
                <Button as={Link} to={`/create/confirm?mapId=${map.id}`}>
                  {lang.choose}
                </Button>
              }
            />
          ))}
        </Grid.Row>
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
                ? lang.page_map_selectTab_loadingZZZ
                : lang.loadMore}
            </button>
          </Grid>
        )}
      </Grid.Column>
    </Grid>
  );
}

export default MapSelectTab;
