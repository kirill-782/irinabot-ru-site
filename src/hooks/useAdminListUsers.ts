import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { AdminListUserListOutWeb } from "../models/rest/AdminList";
import { convertErrorResponseToString } from "../utils/ApiUtils";

const sortUsers = (left: AdminListUserListOutWeb, right: AdminListUserListOutWeb) => {
    return (left.userId || "").localeCompare(right.userId || "", "ru");
};

interface UseAdminListUsersResult {
    users: AdminListUserListOutWeb[];
    isLoading: boolean;
    errorMessage: string;
    reload: (signal?: AbortSignal) => Promise<void>;
}

export const useAdminListUsers = (listId: number): UseAdminListUsersResult => {
    const { adminListApi } = useContext(RestContext);
    const [users, setUsers] = useState<AdminListUserListOutWeb[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            if (!Number.isFinite(listId)) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMessage("");

            try {
                const response = await adminListApi.getAdminListUsers(listId, { signal });

                setUsers([...response].sort(sortUsers));
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

    return { users, isLoading, errorMessage, reload };
};
