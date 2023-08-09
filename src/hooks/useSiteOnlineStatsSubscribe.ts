import { useEffect } from "react";
import { ClientWebsocketConnectStatsConverter } from "../models/websocket/ClientWebsocketConnectStats";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_WEBSOCKET_CONNECT_STATS } from "../models/websocket/HeaderConstants";
import { ServerWebsocketConnectStats } from "../models/websocket/ServerWebsocketConnectStats";
import { GHostPackageEvent, GHostWebSocket } from "../services/GHostWebsocket";

interface SiteOnlineStatsSubscribeOptions {
    ghostSocket: GHostWebSocket;
    onOnlineStats: (games: ServerWebsocketConnectStats) => void;
}

export const useSiteOnlineStatsSubscribe = ({ ghostSocket, onOnlineStats }: SiteOnlineStatsSubscribeOptions) => {
    useEffect(() => {
        const sendStatsRequest = () => {
            if (ghostSocket.isConnected()) {
                let clientWebsocketConnectStatsConverter = new ClientWebsocketConnectStatsConverter();
                ghostSocket.send(clientWebsocketConnectStatsConverter.assembly({}));
            }
        };

        let intervalId;

        if (ghostSocket.isConnected()) sendStatsRequest();

        const onConnectedCount = (event: GHostPackageEvent) => {
            if (event.detail.package.type === DEFAULT_WEBSOCKET_CONNECT_STATS && event.detail.package.context === DEFAULT_CONTEXT_HEADER_CONSTANT) {
                const stats: ServerWebsocketConnectStats = event.detail.package as ServerWebsocketConnectStats;
                onOnlineStats(stats);

                clearTimeout(intervalId);
                intervalId = setTimeout(sendStatsRequest, 5000);
            }
        };

        const onConnectClose = () => {
            clearTimeout(intervalId);
            intervalId = null;
        };

        const onConnectOpen = () => sendStatsRequest();

        ghostSocket.addEventListener("package", onConnectedCount);
        ghostSocket.addEventListener("open", onConnectOpen);
        ghostSocket.addEventListener("close", onConnectClose);

        return () => {
            clearTimeout(intervalId);

            ghostSocket.removeEventListener("package", onConnectedCount);
            ghostSocket.removeEventListener("open", onConnectOpen);
            ghostSocket.removeEventListener("close", onConnectClose);
        };
    }, [ghostSocket, onOnlineStats]);
};
