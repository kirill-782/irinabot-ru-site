import { useContext, useEffect } from "react";
import { CacheContext, WebsocketContext } from "../context";
import { ClientResolveConnectorIdsConverter } from "../models/websocket/ClientResolveConnectorIds";

export const useResolveConnectorIds = (ids: Array<string | number | null | undefined>): void => {
    const { cachedConnectorIds } = useContext(CacheContext);
    const sockets = useContext(WebsocketContext);

    useEffect(() => {
        const candidates = new Set<number>();

        ids.forEach((raw) => {
            if (raw === null || raw === undefined) return;

            const numeric = typeof raw === "number" ? raw : Number(raw);

            if (!Number.isFinite(numeric) || numeric <= 0) return;
            if (cachedConnectorIds[numeric]) return;

            candidates.add(numeric);
        });

        if (candidates.size === 0) return;

        sockets.ghostSocket.send(
            new ClientResolveConnectorIdsConverter().assembly({
                connectorIds: [...candidates],
            })
        );
    }, [ids, cachedConnectorIds, sockets.ghostSocket]);
};
