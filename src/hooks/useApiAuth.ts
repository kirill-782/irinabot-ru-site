import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext, RestContext } from "./../context/index";

import { MapService } from "../services/MapService";
import { DEFAULT_CONFIG } from "../config/ApiConfig";
import { GamesService } from "../services/GamesService";

export interface ApiAuthOptions {
    setMapService: Dispatch<SetStateAction<MapService>>;
    setGamesService: Dispatch<SetStateAction<GamesService>>;
}

export const useApiAuth = ({ setMapService, setGamesService }: ApiAuthOptions) => {
    const authContext = useContext(AuthContext);

    useEffect(() => {
        let newConfig = {};

        if (authContext.auth.apiToken.hasToken()) {
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
        //setGamesService(new GamesService(newConfig));

        setGamesService(new GamesService({ ...newConfig, baseURL: "http://127.0.0.1:1000/" }));
    }, [authContext.auth.apiToken]);
};
