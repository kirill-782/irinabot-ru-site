import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import { RestContext, AppRuntimeSettingsContext } from "../context";
import { HostPresetPropertyOutWeb } from "../models/rest/HostPreset";
import { ConfigProperty, camelToReadable } from "../components/ConfigSettings/PropertyField";
import { convertErrorResponseToString } from "../utils/ApiUtils";

function toConfigProperty(
    p: HostPresetPropertyOutWeb,
    getString: (key: string) => string
): ConfigProperty {
    const titleKey = p.titleLanguageKey ?? undefined;
    const descKey = p.descriptionLanguageKey ?? undefined;
    const name = p.name ?? "";
    return {
        name,
        title: titleKey ? getString(titleKey) || camelToReadable(name) : camelToReadable(name),
        type: (p.type ?? "string") as ConfigProperty["type"],
        category: p.category ?? "general",
        description: descKey ? getString(descKey) || descKey : undefined,
        validation: p.validation as ConfigProperty["validation"],
    };
}

export function useConfigSchema() {
    const { hostPresetApi } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);

    const [rawSchema, setRawSchema] = useState<HostPresetPropertyOutWeb[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const schema = useMemo(
        () => rawSchema.map((p) => toConfigProperty(p, (key) => language.getString(key as any) ?? "")),
        [rawSchema, language.getString]
    );

    const categories = useMemo(() => {
        const seen = new Set<string>();
        return schema.reduce<string[]>((acc, p) => {
            if (!seen.has(p.category)) {
                seen.add(p.category);
                acc.push(p.category);
            }
            return acc;
        }, []);
    }, [schema]);

    useEffect(() => {
        setIsLoading(true);
        hostPresetApi
            .getHostPresetProperties()
            .then(setRawSchema)
            .catch((e) => {
                if (e.message === "canceled") return;
                toast({ title: "Ошибка загрузки схемы", description: convertErrorResponseToString(e), color: "red" });
            })
            .finally(() => setIsLoading(false));
    }, [hostPresetApi]);

    return { schema, categories, isLoading };
}
