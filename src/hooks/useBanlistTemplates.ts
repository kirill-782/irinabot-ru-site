import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { BanlistViolationTemplateOutWeb } from "../models/rest/Banlist";
import { convertErrorResponseToString } from "../utils/ApiUtils";

interface UseBanlistTemplatesResult {
    templates: BanlistViolationTemplateOutWeb[];
    isLoading: boolean;
    errorMessage: string;
    reload: (signal?: AbortSignal) => Promise<void>;
}

export const useBanlistTemplates = (banlistId: number): UseBanlistTemplatesResult => {
    const { banlistApi } = useContext(RestContext);
    const [templates, setTemplates] = useState<BanlistViolationTemplateOutWeb[]>([]);
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
                const response = await banlistApi.getTemplates(banlistId, { signal });

                setTemplates(response);
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

    return { templates, isLoading, errorMessage, reload };
};
