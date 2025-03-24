import { CacheContext, RestContext, WebsocketContext } from "./context";
import { useApiAuth } from "./hooks/useApiAuth";
import { useCategoriesCache } from "./hooks/useCategoriesCache";
import { useConnectorIdCache } from "./hooks/useConnectorIdCache";
import { useVersionsCache } from "./hooks/useVersionsCache";
import React, { useContext, useEffect, useState } from "react";
import { DEFAULT_CONFIG } from "./config/ApiConfig";
import { MapService } from "./services/MapService";
import { MapUploaderService } from "./services/MapUploaderService";
import { GamesService } from "./services/GamesService";

function AfterContextApp(props) {
    const [mapsApi, setMapsApi] = useState(new MapService(DEFAULT_CONFIG));
    const [gamesApi, setGamesApi] = useState(new GamesService(DEFAULT_CONFIG));
    const [mapUploader, setMapUploader] = useState(new MapUploaderService(new MapService(DEFAULT_CONFIG)));

    useEffect(() => {
        mapUploader.setMapService(mapsApi);
    }, [mapsApi, mapUploader]);

    useApiAuth({ setMapService: setMapsApi, setGamesService: setGamesApi });

    const { ghostSocket } = useContext(WebsocketContext);

    const [cachedConnectorIds, cacheConnectorIdsDispatcher] = useConnectorIdCache({ ghostSocket });

    const [cachedCategories, cacheCategories] = useCategoriesCache(mapsApi);

    const [cachedVersions, cacheVersions] = useVersionsCache(mapsApi);

    return (
        <RestContext.Provider
            value={{
                mapsApi,
                gamesApi,
                mapUploader,
            }}
        >
            <CacheContext.Provider
                value={{
                    cachedConnectorIds,
                    cacheConnectorIdsDispatcher,
                    cachedCategories,
                    cacheCategories,
                    cachedVersions,
                    cacheVersions,
                }}
            >
                {props.children}
            </CacheContext.Provider>
        </RestContext.Provider>
    );
}

export default AfterContextApp;
