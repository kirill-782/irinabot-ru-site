import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import { RestContext } from "../context";
import { HostPresetListItemOutWeb } from "../models/rest/HostPreset";
import { convertErrorResponseToString } from "../utils/ApiUtils";

export function useConfigPresets() {
    const { hostPresetApi } = useContext(RestContext);

    const [presets, setPresets] = useState<HostPresetListItemOutWeb[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        hostPresetApi
            .getHostPresets()
            .then(setPresets)
            .catch((e) => {
                if (e.message === "canceled") return;
                toast({ title: "Ошибка загрузки пресетов", description: convertErrorResponseToString(e), color: "red" });
            })
            .finally(() => setIsLoading(false));
    }, [hostPresetApi]);

    const createPreset = useCallback(
        async (name: string) => {
            const preset = await hostPresetApi.createHostPreset({ name });
            setPresets((prev) => [...prev, preset]);
            return preset;
        },
        [hostPresetApi]
    );

    const deletePreset = useCallback(
        async (id: number) => {
            await hostPresetApi.deleteHostPreset(id);
            setPresets((prev) => prev.filter((p) => p.id !== id));
        },
        [hostPresetApi]
    );

    return { presets, isLoading, createPreset, deletePreset };
}
