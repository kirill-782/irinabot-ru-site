import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import {
    BanlistViolationStatsOutWeb,
    BanlistViolationStatsQueryParams,
} from "../models/rest/Banlist";
import { convertErrorResponseToString } from "../utils/ApiUtils";

interface UseBanlistTemplateStatsResult {
    stats: BanlistViolationStatsOutWeb[];
    // общее число записей статистики под текущим фильтром (X-Total-Count), не размер страницы
    total: number;
    isLoading: boolean;
    errorMessage: string;
    // silent (по умолчанию) — фоновое обновление без полноэкранного лоадера
    reload: (silent?: boolean) => Promise<void>;
}

export const useBanlistTemplateStats = (
    banlistId: number,
    templateId: number | null,
    params?: BanlistViolationStatsQueryParams
): UseBanlistTemplateStatsResult => {
    const { banlistApi } = useContext(RestContext);
    const [stats, setStats] = useState<BanlistViolationStatsOutWeb[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const load = useCallback(
        async (signal?: AbortSignal, silent = false) => {
            if (templateId === null) {
                setStats([]);
                setTotal(0);
                return;
            }

            if (!silent) setLoading(true);
            setErrorMessage("");

            try {
                const response = await banlistApi.getTemplateStats(banlistId, templateId, params, {
                    signal,
                });

                setStats(response.stats);
                setTotal(response.total);
            } catch (error) {
                if ((error as Error).message === "canceled") return;

                setErrorMessage(convertErrorResponseToString(error));
            } finally {
                if (!silent && !signal?.aborted) setLoading(false);
            }
        },
        [banlistApi, banlistId, templateId, params]
    );

    useEffect(() => {
        const controller = new AbortController();

        void load(controller.signal);

        return () => {
            controller.abort();
        };
    }, [load]);

    const reload = useCallback((silent = true) => load(undefined, silent), [load]);

    return { stats, total, isLoading, errorMessage, reload };
};
