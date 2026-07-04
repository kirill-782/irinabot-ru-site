import React, { useState } from "react";
import { SiteOnlineStatsContext } from "../context";
import { useSiteOnlineStatsSubscribe } from "../hooks/useSiteOnlineStatsSubscribe";
import { ServerWebsocketConnectStats } from "../models/websocket/ServerWebsocketConnectStats";
import { GHostWebSocket } from "../services/GHostWebsocket";

interface SiteOnlineStatsProviderProps {
    ghostSocket: GHostWebSocket;
    children: React.ReactNode;
}

// Отдельный провайдер для статистики соединений (приходит с сервера раз в ~5с).
//
// Состояние живёт здесь, а не в App: children прокидываются насквозь, поэтому
// при обновлении статистики перерисовывается только этот провайдер и реальные
// потребители SiteOnlineStatsContext — App и остальное дерево не трогаются.
function SiteOnlineStatsProvider({ ghostSocket, children }: SiteOnlineStatsProviderProps) {
    const [siteOnlineStats, setSiteOnlineStats] = useState<ServerWebsocketConnectStats | null>(null);

    useSiteOnlineStatsSubscribe({
        ghostSocket,
        onOnlineStats: setSiteOnlineStats,
    });

    return <SiteOnlineStatsContext.Provider value={siteOnlineStats}>{children}</SiteOnlineStatsContext.Provider>;
}

export default SiteOnlineStatsProvider;
