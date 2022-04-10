import React, { useEffect, useReducer, useState } from "react";
import { AppRuntimeSettingsContext, WebsocketContext } from "./context";
import { GHostWebSocket } from "./services/GHostWebsocket";
import { loadTheme } from "./utils/Theme";

import "react-semantic-toasts/styles/react-semantic-alert.css";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import GameListPage from "./components/Pages/GameListPage";

import "./semantic-ui-sass/template/_index.scss";
import { useGHostSocket } from "./hooks/useGHostSocket";

function App() {
  useEffect(loadTheme, []);

  const ghostSocket = useGHostSocket({ url: "wss://irinabot.ru/ghost/" });

  const [gameListLocked, setGameListLocked] = useState(false);
  return (
    <WebsocketContext.Provider
      value={{
        ghostSocket,
      }}
    >
      <AppRuntimeSettingsContext.Provider
        value={{
          gameList: { locked: gameListLocked, setLocked: setGameListLocked },
        }}
      >
        <Routes>
          <Route path="/*" element={<Layout />}>
            <Route index element={<GameListPage />} />
            <Route path="gamelist" element={<GameListPage />} />
          </Route>
        </Routes>
      </AppRuntimeSettingsContext.Provider>
    </WebsocketContext.Provider>
  );
}

export default App;
