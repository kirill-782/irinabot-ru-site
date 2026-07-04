import { useContext, useEffect, useRef } from "react";
import { CacheContext, WebsocketContext } from "../context";
import { ClientResolveConnectorIdsConverter } from "../models/websocket/ClientResolveConnectorIds";

export const useResolveConnectorIds = (ids: Array<string | number | null | undefined>): void => {
    const { cachedConnectorIds } = useContext(CacheContext);
    const sockets = useContext(WebsocketContext);

    // Читаем актуальный кэш через ref, чтобы эффект НЕ пересобирался на каждое
    // обновление cachedConnectorIds. Иначе неразрешимый id (сервер вернул пустую
    // строку либо не вернул вовсе) уходил в бесконечный цикл: каждый ответ создаёт
    // новую ссылку кэша → эффект → повторный send → ответ → … (десятки запросов/сек).
    const cacheRef = useRef(cachedConnectorIds);
    cacheRef.current = cachedConnectorIds;

    // Запоминаем уже запрошенные id, чтобы не слать повторный запрос, даже если
    // сервер так и не прислал для них ник.
    const requestedRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        const cache = cacheRef.current;
        const candidates = new Set<number>();

        ids.forEach((raw) => {
            if (raw === null || raw === undefined) return;

            const numeric = typeof raw === "number" ? raw : Number(raw);

            if (!Number.isFinite(numeric) || numeric <= 0) return;
            if (cache[numeric]) return;
            if (requestedRef.current.has(numeric)) return;

            candidates.add(numeric);
        });

        if (candidates.size === 0) return;

        candidates.forEach((id) => requestedRef.current.add(id));

        sockets.ghostSocket.send(
            new ClientResolveConnectorIdsConverter().assembly({
                connectorIds: [...candidates],
            })
        );
    }, [ids, sockets.ghostSocket]);
};
