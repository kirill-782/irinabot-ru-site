import Axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { AdminListUserOutWeb } from "../models/rest/AdminList";
import { convertErrorResponseToString } from "../utils/ApiUtils";

const emptyUserData: AdminListUserOutWeb = {
    privilegeLevel: null,
    roles: [],
};

interface UseAdminListUserResult {
    data: AdminListUserOutWeb | null;
    isLoading: boolean;
    errorMessage: string;
    reload: (signal?: AbortSignal) => Promise<void>;
}

export const useAdminListUser = (listId: number, userId: string): UseAdminListUserResult => {
    const { adminListApi } = useContext(RestContext);
    const [data, setData] = useState<AdminListUserOutWeb | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            const normalizedUserId = userId.trim();

            if (!Number.isFinite(listId) || !normalizedUserId) {
                setData(null);
                setErrorMessage("");
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMessage("");

            try {
                const response = await adminListApi.getAdminListUser(listId, normalizedUserId, { signal });

                setData(response);
            } catch (error) {
                if ((error as Error).message === "canceled") return;

                if (Axios.isAxiosError(error) && error.response?.status === 404) {
                    setData(emptyUserData);
                } else {
                    setData(emptyUserData);
                    setErrorMessage(convertErrorResponseToString(error));
                }
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [adminListApi, listId, userId]
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
