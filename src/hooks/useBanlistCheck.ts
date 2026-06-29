import { useCallback, useContext, useState } from "react";
import { RestContext } from "../context";
import { BanlistCheckResultOutWeb } from "../models/rest/Banlist";
import { convertErrorResponseToString } from "../utils/ApiUtils";

export interface BanlistCheckForm {
    userId: string;
    pvpgnRealm: string;
    pvpgnName: string;
    ip: string;
    hardwareId: string;
}

interface UseBanlistCheckResult {
    result: BanlistCheckResultOutWeb | null;
    isLoading: boolean;
    errorMessage: string;
    check: (form: BanlistCheckForm) => Promise<void>;
}

export const useBanlistCheck = (banlistId: number): UseBanlistCheckResult => {
    const { banlistApi } = useContext(RestContext);
    const [result, setResult] = useState<BanlistCheckResultOutWeb | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const check = useCallback(
        async (form: BanlistCheckForm) => {
            setLoading(true);
            setErrorMessage("");
            setResult(null);

            try {
                const response = await banlistApi.checkBan(banlistId, {
                    userId: form.userId.trim() || null,
                    pvpgnRealm: form.pvpgnRealm.trim() || null,
                    pvpgnName: form.pvpgnName.trim() || null,
                    ip: form.ip.trim() || null,
                    hardwareId: form.hardwareId.trim() || null,
                });

                setResult(response);
            } catch (error) {
                setErrorMessage(convertErrorResponseToString(error));
            } finally {
                setLoading(false);
            }
        },
        [banlistApi, banlistId]
    );

    return { result, isLoading, errorMessage, check };
};
