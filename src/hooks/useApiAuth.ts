import { Dispatch, SetStateAction, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "./../context/index";

import { AdminListApplicationAdministratorService } from "../services/AdminListApplicationAdministratorService";
import { AdminListService } from "../services/AdminListService";
import { BanlistService } from "../services/BanlistService";
import { EntitlementService } from "../services/EntitlementService";
import { MapService } from "../services/MapService";
import { RedeemCodeService } from "../services/RedeemCodeService";
import { UpdaterService } from "../services/UpdaterService";
import { HostPresetService } from "../services/HostPresetService";
import { UserNicknameService } from "../services/UserNicknameService";
import { WikiService } from "../services/WikiService";
import { DEFAULT_CONFIG } from "../config/ApiConfig";

export interface ApiAuthOptions {
    setAdminListService: Dispatch<SetStateAction<AdminListService>>;
    setAdminListApplicationAdministratorService: Dispatch<SetStateAction<AdminListApplicationAdministratorService>>;
    setBanlistService: Dispatch<SetStateAction<BanlistService>>;
    setEntitlementService: Dispatch<SetStateAction<EntitlementService>>;
    setMapService: Dispatch<SetStateAction<MapService>>;
    setRedeemService: Dispatch<SetStateAction<RedeemCodeService>>;
    setUpdaterService: Dispatch<SetStateAction<UpdaterService>>;
    setHostPresetService: Dispatch<SetStateAction<HostPresetService>>;
    setUserNicknameService: Dispatch<SetStateAction<UserNicknameService>>;
    setWikiService: Dispatch<SetStateAction<WikiService>>;
}

export const useApiAuth = ({
    setAdminListService,
    setAdminListApplicationAdministratorService,
    setBanlistService,
    setEntitlementService,
    setMapService,
    setRedeemService,
    setUpdaterService,
    setHostPresetService,
    setUserNicknameService,
    setWikiService,
}: ApiAuthOptions) => {
    const authContext = useContext(AuthContext);

    useEffect(() => {
        let newConfig = {};

        // apiToken всегда задан (по умолчанию — AnonymousTokenHolder с пустым токеном),
        // поэтому проверяем именно наличие токена. Иначе для анонима ушёл бы заголовок
        // `Authorization: Bearer ` с пустым значением — а часть API (напр. wiki) отвечает
        // на такой заголовок 401 вместо публичного доступа. Без токена заголовок не шлём.
        if (authContext.auth.apiToken?.hasToken()) {
            const authorization = {
                Authorization: `Bearer ${authContext.auth.apiToken.getToken()}`,
            };

            newConfig = {
                ...DEFAULT_CONFIG,
                headers: { ...DEFAULT_CONFIG.headers, ...authorization },
            };
        } else {
            newConfig = {
                ...DEFAULT_CONFIG,
            };
        }

        setAdminListService(new AdminListService(newConfig));
        setAdminListApplicationAdministratorService(new AdminListApplicationAdministratorService(newConfig));
        setBanlistService(new BanlistService(newConfig));
        setEntitlementService(new EntitlementService(newConfig));
        setMapService(new MapService(newConfig));
        setRedeemService(new RedeemCodeService(newConfig));
        setUpdaterService(new UpdaterService(newConfig));
        setHostPresetService(new HostPresetService(newConfig));
        setUserNicknameService(new UserNicknameService(newConfig));
        setWikiService(new WikiService(newConfig));
    }, [
        authContext.auth.apiToken,
        setAdminListApplicationAdministratorService,
        setAdminListService,
        setBanlistService,
        setEntitlementService,
        setMapService,
        setRedeemService,
        setUpdaterService,
        setHostPresetService,
        setUserNicknameService,
        setWikiService,
    ]);
};
