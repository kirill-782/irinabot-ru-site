import { Dispatch, SetStateAction, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "./../context/index";

import { AdminListApplicationAdministratorService } from "../services/AdminListApplicationAdministratorService";
import { AdminListService } from "../services/AdminListService";
import { MapService } from "../services/MapService";
import { RedeemCodeService } from "../services/RedeemCodeService";
import { UpdaterService } from "../services/UpdaterService";
import { DEFAULT_CONFIG } from "../config/ApiConfig";

export interface ApiAuthOptions {
    setAdminListService: Dispatch<SetStateAction<AdminListService>>;
    setAdminListApplicationAdministratorService: Dispatch<SetStateAction<AdminListApplicationAdministratorService>>;
    setMapService: Dispatch<SetStateAction<MapService>>;
    setRedeemService: Dispatch<SetStateAction<RedeemCodeService>>;
    setUpdaterService: Dispatch<SetStateAction<UpdaterService>>;
}

export const useApiAuth = ({
    setAdminListService,
    setAdminListApplicationAdministratorService,
    setMapService,
    setRedeemService,
    setUpdaterService,
}: ApiAuthOptions) => {
    const authContext = useContext(AuthContext);

    useEffect(() => {
        let newConfig = {};

        if (authContext.auth.apiToken) {
            const authorization = {
                Authorization: `Bearer ${authContext.auth.apiToken.getToken()}`,
            };

            newConfig = {
                ...DEFAULT_CONFIG,
                headers: authorization,
            };
        } else {
            newConfig = {
                ...DEFAULT_CONFIG,
            };
        }

        setAdminListService(new AdminListService(newConfig));
        setAdminListApplicationAdministratorService(new AdminListApplicationAdministratorService(newConfig));
        setMapService(new MapService(newConfig));
        setRedeemService(new RedeemCodeService(newConfig));
        setUpdaterService(new UpdaterService(newConfig));
    }, [
        authContext.auth.apiToken,
        setAdminListApplicationAdministratorService,
        setAdminListService,
        setMapService,
        setRedeemService,
        setUpdaterService,
    ]);
};
