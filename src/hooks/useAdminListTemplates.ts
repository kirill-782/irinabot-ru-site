import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { AdminListTemplateOutWeb } from "../models/rest/AdminList";
import { convertErrorResponseToString } from "../utils/ApiUtils";

interface UseAdminListTemplatesResult {
    templates: AdminListTemplateOutWeb[];
    isLoading: boolean;
    errorMessage: string;
    reload: (signal?: AbortSignal) => Promise<void>;
}

// Шаблоны админ-листа (/v1/admin-lists/{listId}/templates). Паттерн — как useAdminList.
export const useAdminListTemplates = (listId: number): UseAdminListTemplatesResult => {
    const { adminListApi } = useContext(RestContext);
    const [templates, setTemplates] = useState<AdminListTemplateOutWeb[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            if (!Number.isFinite(listId)) {
                setLoading(false);
                setTemplates([]);
                return;
            }

            setLoading(true);
            setErrorMessage("");

            try {
                const response = await adminListApi.getAdminListTemplates(listId, { signal });

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
        [adminListApi, listId]
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
