import React, { useContext } from "react";
import { useEffect, useState, useMemo } from "react";
import { Checkbox, Container, Form, Grid, Header } from "semantic-ui-react";
import { SITE_TITLE } from "../../config/ApplicationConfig";
import { AppRuntimeSettingsContext, WebsocketContext } from "../../context";
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
import MapGameJoinButton from "../MapPage/MapGameJoinButton";

import MetaDescription from "../Meta/MetaDescription";
import { isNoFilters } from "../../hooks/useSearchMaps";
import "./MapListPage.scss";
import FilterDescription from "./../MapListPage/FilterDescription";
import { useTitle } from "../../hooks/useTitle";

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
    const [searchOptions, setSearchOptions] = useState<[SearchFilters | null, SearchOrder | null]>([null, null]);

    useSearchFiltersQuerySync(searchOptions, setSearchOptions);

    const [searchValue, setSearchValue] = useState("");
    const [mapIds, setMapsId] = useState("");

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

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

    const [searchedMaps, isFull, isLoading, errorMessage, loadNextPage] = useSearchMaps(
        requestFilter,
        searchOptions[1],
        searchValue
    );

    useTitle(lang.mapListPageTitle);

    useEffect(() => {
        if (isVisible) loadNextPage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    return (
        <Container className="map-list-page">
            <MetaDescription description={lang.mapListPageDescription} />
            <Form>
                <Grid columns="equal" stackable centered>
                    {disableFilters !== "true" && (
                        <Grid.Column width={3} style={{ position: "sticky" }}>
                            <Header size="small">{lang.mapListPageFilters}</Header>
                            <MapFilters
                                onFitlerChange={setSearchOptions}
                                value={searchOptions}
                                defaultFilters={defaultFilters}
                            />
                        </Grid.Column>
                    )}
                    <Grid.Column width={13}>
                        {disableFilters === "true" && <FilterDescription filters={searchOptions} />}
                        <Header>{lang.mapListPageMapList}</Header>
                        <Grid.Row className="map-list-page-search-field">
                            <Form.Input
                                fluid
                                onChange={(_, data) => {
                                    setSearchValue(data.value);
                                }}
                                loading={isLoading}
                                value={searchValue}
                                error={!!errorMessage}
                                label={lang.mapListSearchMapLabel}
                                placeholder={lang.mapListSearchMapPlaceholder}
                            />
                        </Grid.Row>
                        {searchedMaps &&
                            searchedMaps.map((map, key) => {
                                return (
                                    <React.Fragment key={map.id}>
                                        <MapCard {...map} />
                                        <Grid padded="vertically">
                                            <Grid.Row className="player-stats">
                                                <MapGameJoinButton mapId={map.id || 0} />
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
                                    {isLoading ? lang.loadingDotted : lang.mapListLoadMore}
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
