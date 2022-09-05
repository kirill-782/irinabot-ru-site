import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext, RestContext } from "./../context/index";

import { MapService } from "../services/MapService";
import { DEFAULT_CONFIG } from "../config/ApiConfig";

export interface ApiAuthOptions {
  setMapService: Dispatch<SetStateAction<MapService>>;
}

export const useApiAuth = ({ setMapService }: ApiAuthOptions) => {
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
  }, [authContext.auth.apiToken]);
};
