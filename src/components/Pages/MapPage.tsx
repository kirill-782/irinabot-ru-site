import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Grid, Loader, Message } from "semantic-ui-react";
import { AppRuntimeSettingsContext, RestContext, WebsocketContext } from "../../context";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import { Map } from "../../models/rest/Map";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import MapHeader from "../MapPage/MapHeader";
import MapSlots from "../MapPage/MapSlots";
import { escapeWC3Tags } from "../../utils/WC3TestUtils";
import MapFooter from "./../MapPage/MapFooter";
import MapDescription from "../MapPage/MapDescription";
import MapFlags from "./../MapPage/MapFlags";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { useGameListSubscribe } from "../../hooks/useGameListSubscribe";
import MetaDescription from "../Meta/MetaDescription";
import MetaRobots from "../Meta/MetaRobots";
import React from "react";
import { MapContext } from "../../context";
import { useTitle } from "../../hooks/useTitle";
import { useAdsRender } from "../../hooks/useAdsRender";

function MapPage() {
    const { id } = useParams();
    const mapsApi = useContext(RestContext).mapsApi;
    const [mapData, setMapData] = useState<Map | null>(null);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [config, setConfig] = useState<ConfigInfo | undefined | null>();

    const [noIndex, setNoIndex] = useState(false);

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    useTitle(escapeWC3Tags(mapData?.mapInfo.name), lang.mapListPageTitle);

    useEffect(() => {
        const abort = new AbortController();

        setLoading(true);
        setNoIndex(false);

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

                if (e.response && (e.response.status === 404 || e.response.status === 403)) {
                    setNoIndex(true);
                }
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
                    .getDefaultMapConfig(parseInt(id || "0"), readyConfigs[0].version || "", { signal: abort.signal })
                    .then((config) => {
                        setConfig(config);
                    });
            } else setConfig(null);
        }

        return () => {
            abort.abort();
        };
    }, [id, mapData]);

    useAdsRender("R-A-3959850-2", "yandex_rtb_mapfooter");

    return (
        <Container>
            <MetaRobots noIndex={!!noIndex || !mapData?.mapInfo?.name} />
            <MetaDescription description={escapeWC3Tags(mapData?.mapInfo?.description || "")} />
            {errorMessage && (
                <Message error>
                    <p>{errorMessage}</p>
                </Message>
            )}
            {isLoading && (
                <Loader active size="big">
                    {lang.loadingDotted}
                </Loader>
            )}
            {mapData && (
                <MapContext.Provider
                    value={{
                        map: mapData,
                        setMap: setMapData,
                    }}
                >
                    <Grid columns="equal" stackable padded="vertically">
                        <Grid.Row>
                            <MapHeader />
                        </Grid.Row>
                        {mapData?.additionalFlags?.mapDescription && (
                            <MapDescription desctiption={mapData?.additionalFlags?.mapDescription} />
                        )}
                        <Grid.Row>
                            <MapFlags />
                        </Grid.Row>
                        <Grid.Row id="yandex_rtb_mapfooter"></Grid.Row>
                        <MapFooter />
                        <Grid.Row>
                            {config === undefined && (
                                <Loader size="big" active>
                                    {lang.mapPageConfigLoading}
                                </Loader>
                            )}
                            {config === null && (
                                <Message style={{ width: "100%" }} info>
                                    {lang.mapPageSlotsNotParsed}
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
                </MapContext.Provider>
            )}
        </Container>
    );
}

export default MapPage;
