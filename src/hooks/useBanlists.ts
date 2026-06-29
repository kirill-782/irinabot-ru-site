import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { BanlistOutWeb } from "../models/rest/Banlist";
import { convertErrorResponseToString } from "../utils/ApiUtils";

interface UseBanlistsResult {
    banlists: BanlistOutWeb[];
    isLoading: boolean;
    errorMessage: string;
    reload: (signal?: AbortSignal) => Promise<void>;
}

export const useBanlists = (): UseBanlistsResult => {
    const { banlistApi } = useContext(RestContext);
    const [banlists, setBanlists] = useState<BanlistOutWeb[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await banlistApi.getBanlists({ signal });

                setBanlists(response);
            } catch (error) {
                if ((error as Error).message === "canceled") return;

                setErrorMessage(convertErrorResponseToString(error));
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [banlistApi]
    );

    useEffect(() => {
        const controller = new AbortController();

        void reload(controller.signal);

        return () => {
            controller.abort();
        };
    }, [reload]);

    return { banlists, isLoading, errorMessage, reload };
};
