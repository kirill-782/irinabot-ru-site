import { Dispatch, SetStateAction, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "./../context/index";

import { MapService } from "../services/MapService";
import { RedeemCodeService } from "../services/RedeemCodeService";
import { DEFAULT_CONFIG } from "../config/ApiConfig";

export interface ApiAuthOptions {
    setMapService: Dispatch<SetStateAction<MapService>>;
    setRedeemService: Dispatch<SetStateAction<RedeemCodeService>>;
}

export const useApiAuth = ({ setMapService, setRedeemService }: ApiAuthOptions) => {
    const authContext = useContext(AuthContext);

    useEffect(() => {
        let newConfig = {};

        if (authContext.auth.apiToken) {
            newConfig = {
                ...DEFAULT_CONFIG,
                headers: {
                    Authorization: `Bearer ${authContext.auth.apiToken.getToken()}`,
                },
            };
        } else {
            newConfig = {
                ...DEFAULT_CONFIG,
            };
        }

        setMapService(new MapService(newConfig));
        setRedeemService(new RedeemCodeService(newConfig));
    }, [authContext.auth.apiToken, setMapService, setRedeemService]);
};
