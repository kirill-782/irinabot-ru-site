import Axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { AdminListUserOutWeb } from "../models/rest/AdminList";
import { convertErrorResponseToString } from "../utils/ApiUtils";

const emptyEveryoneData: AdminListUserOutWeb = {
    privilegeLevel: null,
    roles: [],
};

interface UseAdminListEveryoneResult {
    data: AdminListUserOutWeb | null;
    isLoading: boolean;
    errorMessage: string;
    reload: (signal?: AbortSignal) => Promise<void>;
}

// Wildcard-роли «все пользователи». Запрашивается лениво (enabled), т.к. доступно только владельцу.
export const useAdminListEveryone = (listId: number, enabled: boolean): UseAdminListEveryoneResult => {
    const { adminListApi } = useContext(RestContext);
    const [data, setData] = useState<AdminListUserOutWeb | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            if (!enabled || !Number.isFinite(listId)) {
                setData(null);
                setErrorMessage("");
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMessage("");

            try {
                const response = await adminListApi.getAdminListEveryone(listId, { signal });

                setData(response);
            } catch (error) {
                if ((error as Error).message === "canceled") return;

                if (Axios.isAxiosError(error) && error.response?.status === 404) {
                    setData(emptyEveryoneData);
                } else {
                    setData(emptyEveryoneData);
                    setErrorMessage(convertErrorResponseToString(error));
                }
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [adminListApi, listId, enabled]
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
