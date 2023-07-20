import React, { useContext, useState } from "react";
import { Menu } from "semantic-ui-react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../../context";
import { useSiteOnlineStatsSubscribe } from "../../hooks/useSiteOnlineStatsSubscribe";
import { ServerWebsocketConnectStats } from "./../../models/websocket/ServerWebsocketConnectStats";

interface OnlineStatsCounterProps {
  showAlways?: boolean;
}

function OnlineStatsCounter({ showAlways }: OnlineStatsCounterProps) {
  let sockets = useContext(WebsocketContext);

  const [connected, setConnected] = useState(0);
  const [logined, setLogined] = useState(0);

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  const updateOnlineStats = (stats: ServerWebsocketConnectStats) => {
    setConnected(stats.connected);
    setLogined(stats.logined);
  };

  useSiteOnlineStatsSubscribe({
    ghostSocket: sockets.ghostSocket,
    onOnlineStats: updateOnlineStats,
  });

  return showAlways || logined > 0 ? (
    <Menu.Item title={lang.connected + ": " + connected}>
      {logined}
    </Menu.Item>
  ) : null;
}

export default OnlineStatsCounter;
