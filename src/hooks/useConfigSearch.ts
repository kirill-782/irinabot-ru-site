import { useMemo, useState } from "react";
import { ConfigProperty } from "../components/ConfigSettings/PropertyField";

export function useConfigSearch(schema: ConfigProperty[], categories: string[]) {
    const [searchQuery, setSearchQuery] = useState("");

    const searchLower = searchQuery.trim().toLowerCase();

    const matchingProps = useMemo(() => {
        if (!searchLower) return new Set<string>();
        return new Set(
            schema
                .filter(
                    (p) =>
                        p.name.toLowerCase().includes(searchLower) ||
                        p.title.toLowerCase().includes(searchLower) ||
                        (p.description && p.description.toLowerCase().includes(searchLower))
                )
                .map((p) => p.name)
        );
    }, [searchLower, schema]);

    const matchCountByCategory = useMemo(() => {
        if (!searchLower) return {} as Record<string, number>;
        return categories.reduce<Record<string, number>>((acc, cat) => {
            acc[cat] = schema.filter((p) => p.category === cat && matchingProps.has(p.name)).length;
            return acc;
        }, {});
    }, [searchLower, matchingProps, categories, schema]);

    return {
        searchQuery,
        setSearchQuery,
        searchLower,
        matchingProps,
        matchCountByCategory,
    };
}
