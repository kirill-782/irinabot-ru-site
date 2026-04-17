import { CacheContext, RestContext, WebsocketContext } from "./context";
import { useApiAuth } from "./hooks/useApiAuth";
import { useCategoriesCache } from "./hooks/useCategoriesCache";
import { useConnectorIdCache } from "./hooks/useConnectorIdCache";
import { useVersionsCache } from "./hooks/useVersionsCache";
import React, { useContext, useEffect, useState } from "react";
import { DEFAULT_CONFIG } from "./config/ApiConfig";
import { AdminListApplicationAdministratorService } from "./services/AdminListApplicationAdministratorService";
import { AdminListService } from "./services/AdminListService";
import { MapDownloaderService } from "./services/MapDownloaderService";
import { MapService } from "./services/MapService";
import { MapUploaderService } from "./services/MapUploaderService";
import { RedeemCodeService } from "./services/RedeemCodeService";
import { UpdaterService } from "./services/UpdaterService";

function AfterContextApp(props) {
    const [adminListApi, setAdminListApi] = useState(new AdminListService(DEFAULT_CONFIG));
    const [adminListAppAdminApi, setAdminListAppAdminApi] = useState(
        new AdminListApplicationAdministratorService(DEFAULT_CONFIG)
    );
    const [mapsApi, setMapsApi] = useState(new MapService(DEFAULT_CONFIG));
    const [mapDownloader] = useState(new MapDownloaderService());
    const [mapUploader] = useState(new MapUploaderService(new MapService(DEFAULT_CONFIG)));
    const [redeemApi, setRedeemApi] = useState(new RedeemCodeService(DEFAULT_CONFIG));
    const [updaterApi, setUpdaterApi] = useState(new UpdaterService(DEFAULT_CONFIG));

    useEffect(() => {
        mapUploader.setMapService(mapsApi);
    }, [mapsApi, mapUploader]);

    useApiAuth({
        setAdminListService: setAdminListApi,
        setAdminListApplicationAdministratorService: setAdminListAppAdminApi,
        setMapService: setMapsApi,
        setRedeemService: setRedeemApi,
        setUpdaterService: setUpdaterApi,
    });

    const { ghostSocket } = useContext(WebsocketContext);

    const [cachedConnectorIds, cacheConnectorIdsDispatcher] = useConnectorIdCache({ ghostSocket });

    const [cachedCategories, cacheCategories] = useCategoriesCache(mapsApi);

    const [cachedVersions, cacheVersions] = useVersionsCache(mapsApi);

    return (
        <RestContext.Provider
            value={{
                adminListApi,
                adminListAppAdminApi,
                mapDownloader,
                mapsApi,
                mapUploader,
                redeemApi,
                updaterApi,
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
