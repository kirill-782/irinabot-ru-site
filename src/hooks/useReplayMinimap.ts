import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { getMapIdFromPath } from "../utils/ReplayClicks";

interface UseReplayMinimapResult {
    /** Ссылка на картинку миникарты. undefined — рисуем на чёрном фоне. */
    imageUrl?: string;
    isLoading: boolean;
    /** Идентификатор, вытащенный из пути карты в реплее. */
    mapId?: number;
}

/**
 * Миникарта для реплея. Хостбот сохраняет скачанные карты как `<id>_<имя>.w3x`, поэтому
 * идентификатор берётся прямо из пути в реплее.
 *
 * Карты из старых реплеев в каталоге может уже не быть (сервер отвечает 404) — это штатный
 * случай, ошибку не показываем, точки просто рисуются на чёрном фоне.
 */
export const useReplayMinimap = (mapPath?: string): UseReplayMinimapResult => {
    const { mapsApi } = useContext(RestContext);

    const [imageUrl, setImageUrl] = useState<string>();
    const [isLoading, setLoading] = useState(false);

    const mapId = getMapIdFromPath(mapPath);

    const load = useCallback(
        async (signal?: AbortSignal) => {
            if (!mapId) return;

            setLoading(true);

            try {
                const map = await mapsApi.getMapInfo(mapId, { signal });

                if (signal?.aborted) return;

                setImageUrl(map.mapInfo?.mapImageUrl || undefined);
            } catch (error) {
                if (signal?.aborted) return;

                setImageUrl(undefined);
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [mapId, mapsApi]
    );

    useEffect(() => {
        const controller = new AbortController();

        setImageUrl(undefined);
        void load(controller.signal);

        return () => controller.abort();
    }, [load]);

    return { imageUrl, isLoading, mapId };
};
