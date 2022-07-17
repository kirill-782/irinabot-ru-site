import React, { useEffect, useState } from "react";
import {
  AppRuntimeSettingsContext,
  AuthAction,
  AuthContext,
  AuthData,
  RestContext,
  WebsocketContext,
} from "./context";
import { loadTheme } from "./utils/Theme";

import "react-semantic-toasts/styles/react-semantic-alert.css";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import GameListPage from "./components/Pages/GameListPage";

import "./semantic-ui-sass/template/_index.scss";
import { useGHostSocket } from "./hooks/useGHostSocket";
import { useWebsocketAuth } from "./hooks/useWebsocketAuth";
import OauthStubPage from "./components/Pages/OauthStubPage";
import { useConnectorSocket } from "./hooks/useConnectorSocket";
import { useConnectorGameAdd } from "./hooks/useConnectorGameAdd";
import { MapService } from "./services/MapService";
import { MapUploaderService } from "./services/MapUploaderService";
import AutopayPage from "./components/Pages/AutopayPage";
import RegisterAccountModal from "./components/Modal/RegisterAccountModal";
import CreateGame from "./components/CreateGame";
import {
  CONNECTOR_WEBSOCKET_ENDPOINT,
  WEBSOCKET_ENDPOINT,
} from "./config/ApplicationConfig";

import { DEFAULT_CONFIG } from "./config/ApiConfig";
import { useApiAuth } from "./hooks/useApiAuth";
import AfterContextApp from "./AfterContextApp";

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
          chat: {}
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
            <AfterContextApp>
              <Routes>
                <Route path="/*" element={<Layout />}>
                  <Route index element={<GameListPage />} />
                  <Route path="gamelist" element={<GameListPage />} />
                  <Route path="autopay" element={<AutopayPage />} />
                  <Route path="create" element={<CreateGame />} />
                </Route>
                <Route path="/oauth" element={<OauthStubPage />} />
              </Routes>
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
          </RestContext.Provider>
        </AuthContext.Provider>
      </AppRuntimeSettingsContext.Provider>
    </WebsocketContext.Provider>
  );
}

export default App;
