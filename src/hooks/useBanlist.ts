import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { BanlistOutWeb } from "../models/rest/Banlist";
import { convertErrorResponseToString } from "../utils/ApiUtils";

interface UseBanlistResult {
    data: BanlistOutWeb | null;
    isLoading: boolean;
    errorMessage: string;
    reload: (signal?: AbortSignal) => Promise<void>;
}

export const useBanlist = (banlistId: number): UseBanlistResult => {
    const { banlistApi } = useContext(RestContext);
    const [data, setData] = useState<BanlistOutWeb | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            if (!Number.isFinite(banlistId)) {
                setLoading(false);
                setErrorMessage("Некорректный идентификатор банлиста.");
                return;
            }

            setLoading(true);
            setErrorMessage("");

            try {
                const response = await banlistApi.getBanlist(banlistId, { signal });

                setData(response);
            } catch (error) {
                if ((error as Error).message === "canceled") return;

                setErrorMessage(convertErrorResponseToString(error));
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [banlistApi, banlistId]
    );

    useEffect(() => {
        const controller = new AbortController();

        void reload(controller.signal);

        return () => {
            controller.abort();
        };
    }, [reload]);

    return { data, isLoading, errorMessage, reload };
};
