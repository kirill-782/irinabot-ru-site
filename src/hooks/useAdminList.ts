import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { AdminListOutWeb } from "../models/rest/AdminList";
import { convertErrorResponseToString } from "../utils/ApiUtils";

interface UseAdminListResult {
    data: AdminListOutWeb | null;
    setData: React.Dispatch<React.SetStateAction<AdminListOutWeb | null>>;
    isLoading: boolean;
    errorMessage: string;
    reload: (signal?: AbortSignal) => Promise<void>;
}

export const useAdminList = (listId: number): UseAdminListResult => {
    const { adminListApi } = useContext(RestContext);
    const [data, setData] = useState<AdminListOutWeb | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            if (!Number.isFinite(listId)) {
                setLoading(false);
                setErrorMessage("Некорректный идентификатор списка.");
                return;
            }

            setLoading(true);
            setErrorMessage("");

            try {
                const response = await adminListApi.getAdminList(listId, { signal });

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
        [adminListApi, listId]
    );

    useEffect(() => {
        const controller = new AbortController();

        void reload(controller.signal);

        return () => {
            controller.abort();
        };
    }, [reload]);

    return { data, setData, isLoading, errorMessage, reload };
};
