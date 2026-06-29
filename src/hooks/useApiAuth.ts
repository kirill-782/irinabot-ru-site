import { Dispatch, SetStateAction, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "./../context/index";

import { AdminListApplicationAdministratorService } from "../services/AdminListApplicationAdministratorService";
import { AdminListService } from "../services/AdminListService";
import { BanlistService } from "../services/BanlistService";
import { MapService } from "../services/MapService";
import { RedeemCodeService } from "../services/RedeemCodeService";
import { UpdaterService } from "../services/UpdaterService";
import { HostPresetService } from "../services/HostPresetService";
import { UserNicknameService } from "../services/UserNicknameService";
import { DEFAULT_CONFIG } from "../config/ApiConfig";

export interface ApiAuthOptions {
    setAdminListService: Dispatch<SetStateAction<AdminListService>>;
    setAdminListApplicationAdministratorService: Dispatch<SetStateAction<AdminListApplicationAdministratorService>>;
    setBanlistService: Dispatch<SetStateAction<BanlistService>>;
    setMapService: Dispatch<SetStateAction<MapService>>;
    setRedeemService: Dispatch<SetStateAction<RedeemCodeService>>;
    setUpdaterService: Dispatch<SetStateAction<UpdaterService>>;
    setHostPresetService: Dispatch<SetStateAction<HostPresetService>>;
    setUserNicknameService: Dispatch<SetStateAction<UserNicknameService>>;
}

export const useApiAuth = ({
    setAdminListService,
    setAdminListApplicationAdministratorService,
    setBanlistService,
    setMapService,
    setRedeemService,
    setUpdaterService,
    setHostPresetService,
    setUserNicknameService,
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
        setBanlistService(new BanlistService(newConfig));
        setMapService(new MapService(newConfig));
        setRedeemService(new RedeemCodeService(newConfig));
        setUpdaterService(new UpdaterService(newConfig));
        setHostPresetService(new HostPresetService(newConfig));
        setUserNicknameService(new UserNicknameService(newConfig));
    }, [
        authContext.auth.apiToken,
        setAdminListApplicationAdministratorService,
        setAdminListService,
        setBanlistService,
        setMapService,
        setRedeemService,
        setUpdaterService,
        setHostPresetService,
        setUserNicknameService,
    ]);
};
