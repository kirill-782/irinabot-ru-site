import React, { useEffect, useReducer, useState } from "react";
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

function App() {
  useEffect(loadTheme, []);

  const [ghostSocket, isGHostSocketConnected] = useGHostSocket({
    url: "wss://irinabot.ru/ghost/",
  });

  const [connectorSocket, isConnectorSocketConnected] = useConnectorSocket({
    url: "ws://127.0.0.1:8148",
  });
  const [gameListLocked, setGameListLocked] = useState(false);

  const [authState, authDispatcher] = useWebsocketAuth({ ghostSocket });

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
              mapsApi: new MapService(),
              mapUploader: new MapUploaderService(new MapService()),
            }}
          >
            <Routes>
              <Route path="/*" element={<Layout />}>
                <Route index element={<GameListPage />} />
                <Route path="gamelist" element={<GameListPage />} />
              </Route>
              <Route path="/oauth" element={<OauthStubPage />} />
            </Routes>
          </RestContext.Provider>
        </AuthContext.Provider>
      </AppRuntimeSettingsContext.Provider>
    </WebsocketContext.Provider>
  );
}

export default App;
