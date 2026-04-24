import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import { RestContext } from "../context";
import { HostPresetBnets, HostPresetSlots } from "../models/rest/HostPreset";
import { ConfigProperty } from "../components/ConfigSettings/PropertyField";
import { convertErrorResponseToString } from "../utils/ApiUtils";

function parseValue(type: string, raw: string | undefined | null): any {
    if (raw === undefined || raw === null) return undefined;
    switch (type) {
        case "bool":
            return raw === "true" || raw === "1";
        case "number":
            return raw === "" ? "" : Number(raw);
        default:
            return raw;
    }
}

function serializeValue(value: any): string | null {
    if (value === undefined || value === null) return null;
    return String(value);
}

export function useConfigPreset(presetId: number | null, schema: ConfigProperty[]) {
    const { hostPresetApi } = useContext(RestContext);

    const [values, setValues] = useState<Record<string, any>>({});
    const [slots, setSlots] = useState<HostPresetSlots>({});
    const [bnets, setBnets] = useState<HostPresetBnets>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const abortRef = useRef<AbortController | null>(null);
    const resetCounterRef = useRef(0);

    const loadPreset = useCallback(
        (id: number, signal?: AbortSignal) => {
            setIsLoading(true);
            hostPresetApi
                .getHostPreset(id, { signal })
                .then((preset) => {
                    const rawProps = preset.properties ?? {};
                    const parsed: Record<string, any> = {};
                    for (const prop of schema) {
                        parsed[prop.name] = parseValue(prop.type, rawProps[prop.name]);
                    }
                    setValues(parsed);
                    setSlots(preset.slots ?? {});
                    setBnets(preset.bnets ?? {});
                    setHasChanges(false);
                })
                .catch((e) => {
                    if (e.message === "canceled") return;
                    toast({
                        title: "Ошибка загрузки пресета",
                        description: convertErrorResponseToString(e),
                        color: "red",
                    });
                })
                .finally(() => setIsLoading(false));
        },
        [hostPresetApi, schema]
    );

    useEffect(() => {
        if (presetId === null) {
            setValues({});
            setSlots({});
            setBnets({});
            setHasChanges(false);
            return;
        }

        abortRef.current?.abort();
        abortRef.current = new AbortController();
        loadPreset(presetId, abortRef.current.signal);
    }, [presetId, loadPreset, resetCounterRef.current]);

    const handlePropertyChange = useCallback((name: string, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setHasChanges(true);
    }, []);

    const handlePropertyDelete = useCallback((name: string) => {
        setValues((prev) => ({ ...prev, [name]: null }));
        setHasChanges(true);
    }, []);

    const handleSlotsChange = useCallback((s: HostPresetSlots) => {
        setSlots(s);
        setHasChanges(true);
    }, []);

    const handleBnetsChange = useCallback((b: HostPresetBnets) => {
        setBnets(b);
        setHasChanges(true);
    }, []);

    const save = useCallback(() => {
        if (presetId === null) return;
        setIsSaving(true);

        const serialized: Record<string, string | null> = {};
        for (const [key, val] of Object.entries(values)) {
            serialized[key] = serializeValue(val);
        }

        hostPresetApi
            .patchHostPreset(presetId, { slots, bnets, properties: serialized })
            .then(() => {
                setHasChanges(false);
                toast({ title: "Сохранено", icon: "check" });
            })
            .catch((e) => {
                toast({
                    title: "Ошибка сохранения",
                    description: convertErrorResponseToString(e),
                    color: "red",
                });
            })
            .finally(() => setIsSaving(false));
    }, [presetId, hostPresetApi, values, slots, bnets]);

    const reset = useCallback(() => {
        if (presetId === null) return;
        // Clear accumulated local state and re-fetch from server
        setValues({});
        setSlots({});
        setBnets({});
        setHasChanges(false);
        // Increment counter to trigger useEffect re-fetch
        resetCounterRef.current += 1;

        abortRef.current?.abort();
        abortRef.current = new AbortController();
        loadPreset(presetId, abortRef.current.signal);
    }, [presetId, loadPreset]);

    return {
        values,
        slots,
        bnets,
        hasChanges,
        isLoading,
        isSaving,
        handlePropertyChange,
        handlePropertyDelete,
        handleSlotsChange,
        handleBnetsChange,
        save,
        reset,
    };
}
