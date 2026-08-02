import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { BanlistOutWeb, BanlistsFilter } from "../models/rest/Banlist";
import { convertErrorResponseToString } from "../utils/ApiUtils";

interface UseBanlistsResult {
    banlists: BanlistOutWeb[];
    // общее число банлистов под фильтром (X-Total-Count) — может быть больше
    // длины banlists, если запрос ограничен пагинацией
    total: number;
    isLoading: boolean;
    errorMessage: string;
    reload: (signal?: AbortSignal) => Promise<void>;
}

// filter не задан — сервер отдаёт и свои, и общие банлисты (сначала свои).
export const useBanlists = (filter?: BanlistsFilter): UseBanlistsResult => {
    const { banlistApi } = useContext(RestContext);
    const [banlists, setBanlists] = useState<BanlistOutWeb[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await banlistApi.getBanlists(filter ? { filter } : undefined, {
                    signal,
                });

                setBanlists(response.banlists);
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
        [banlistApi, filter]
    );

    useEffect(() => {
        const controller = new AbortController();

        void reload(controller.signal);

        return () => {
            controller.abort();
        };
    }, [reload]);

    return { banlists, total, isLoading, errorMessage, reload };
};
