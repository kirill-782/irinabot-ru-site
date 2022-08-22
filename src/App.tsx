import React, { useEffect, useState } from "react";
import {
  AppRuntimeSettingsContext,
  AuthAction,
  AuthContext,
  AuthData,
  CacheContext,
  RestContext,
  WebsocketContext,
} from "./context";
import { loadTheme } from "./utils/Theme";

import "react-semantic-toasts/styles/react-semantic-alert.css";
import { Routes } from "react-router-dom";

import "./semantic-ui-sass/template/_index.scss";
import "./components/Slider.scss";
import { useGHostSocket } from "./hooks/useGHostSocket";
import { useWebsocketAuth } from "./hooks/useWebsocketAuth";
import { useConnectorIdCache } from "./hooks/useConnectorIdCache";
import { useConnectorSocket } from "./hooks/useConnectorSocket";
import { useConnectorGameAdd } from "./hooks/useConnectorGameAdd";
import { MapService } from "./services/MapService";
import { MapUploaderService } from "./services/MapUploaderService";
import RegisterAccountModal from "./components/Modal/RegisterAccountModal";
import {
  CONNECTOR_WEBSOCKET_ENDPOINT,
  WEBSOCKET_ENDPOINT,
} from "./config/ApplicationConfig";

import { DEFAULT_CONFIG } from "./config/ApiConfig";
import AfterContextApp from "./AfterContextApp";
import RouteList from "./components/RouteList";
import AccessListModal from "./components/Modal/AccessListModal";

function App() {
  useEffect(loadTheme, []);

  const [ghostSocket, isGHostSocketConnected] = useGHostSocket({
    url: WEBSOCKET_ENDPOINT,
  });

  const [connectorSocket, isConnectorSocketConnected] = useConnectorSocket({
    url: CONNECTOR_WEBSOCKET_ENDPOINT,
  });
  const [gameListLocked, setGameListLocked] = useState(false);

  const [authState, authDispatcher, needRegisterModal] = useWebsocketAuth({
    ghostSocket,
  });

  useConnectorGameAdd({ ghostSocket, connectorSocket });

  const [cachedConnectorIds, cacheConnectorIdsDispatcher] = useConnectorIdCache(
    { ghostSocket }
  );

  return (
    <WebsocketContext.Provider
      value={{
        ghostSocket,
        isGHostSocketConnected,
        connectorSocket,
        isConnectorSocketConnected,
      }}
    >
      <AppRuntimeSettingsContext.Provider
        value={{
          gameList: { locked: gameListLocked, setLocked: setGameListLocked },
          chat: {},
        }}
      >
        <AuthContext.Provider
          value={{
            auth: authState as AuthData,
            dispatchAuth: authDispatcher as React.Dispatch<AuthAction>,
          }}
        >
          <RestContext.Provider
            value={{
              mapsApi: new MapService(DEFAULT_CONFIG),
              mapUploader: new MapUploaderService(
                new MapService(DEFAULT_CONFIG)
              ),
            }}
          >
            <CacheContext.Provider
              value={{ cachedConnectorIds, cacheConnectorIdsDispatcher }}
            >
              <AfterContextApp>
                <RouteList />
                <RegisterAccountModal
                  open={needRegisterModal}
                  onApprove={() => {
                    authDispatcher({ action: "setForce", payload: true });
                  }}
                  onReject={() => {
                    authDispatcher({ action: "clearCredentials" });
                  }}
                ></RegisterAccountModal>
              </AfterContextApp>
            </CacheContext.Provider>
          </RestContext.Provider>
        </AuthContext.Provider>
      </AppRuntimeSettingsContext.Provider>
    </WebsocketContext.Provider>
  );
}

export default App;
