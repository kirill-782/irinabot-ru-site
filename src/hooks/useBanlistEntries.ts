import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { BanlistEntriesQueryParams, BanlistEntryOutWeb } from "../models/rest/Banlist";
import { convertErrorResponseToString } from "../utils/ApiUtils";

interface UseBanlistEntriesResult {
    entries: BanlistEntryOutWeb[];
    // общее число записей под текущим фильтром (X-Total-Count), не размер страницы
    total: number;
    isLoading: boolean;
    errorMessage: string;
    reload: (signal?: AbortSignal) => Promise<void>;
}

export const useBanlistEntries = (
    banlistId: number,
    params?: BanlistEntriesQueryParams
): UseBanlistEntriesResult => {
    const { banlistApi } = useContext(RestContext);
    const [entries, setEntries] = useState<BanlistEntryOutWeb[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            if (!Number.isFinite(banlistId)) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMessage("");

            try {
                const response = await banlistApi.getEntries(banlistId, params, { signal });

                setEntries(response.entries);
                setTotal(response.total);
            } catch (error) {
                if ((error as Error).message === "canceled") return;

                setErrorMessage(convertErrorResponseToString(error));
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [banlistApi, banlistId, params]
    );

    useEffect(() => {
        const controller = new AbortController();

        void reload(controller.signal);

        return () => {
            controller.abort();
        };
    }, [reload]);

    return { entries, total, isLoading, errorMessage, reload };
};
