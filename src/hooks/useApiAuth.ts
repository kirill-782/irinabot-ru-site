import { useEffect } from "react";
import { useContext } from "react";
import { AuthContext, RestContext } from "./../context/index";

import { MapService } from "../services/MapService";
import { DEFAULT_CONFIG } from "../config/ApiConfig";

export const useApiAuth = () => {
  const authContext = useContext(AuthContext);
  const restContext = useContext(RestContext);

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

    restContext.mapsApi = new MapService(newConfig);

    restContext.mapUploader.setMapService(restContext.mapsApi);
  }, [authContext.auth.apiToken, restContext]);
};
