import { useCallback, useEffect, useMemo, useState } from "react";
import {
    BANLIST_ENTRY_COLUMN_KEYS,
    BanlistEntryColumnKey,
} from "../utils/BanlistEntryColumns";

const STORAGE_KEY = "banlistEntryHiddenColumns";

export interface UseBanlistEntryColumnsResult {
    // скрытые колонки (то, что лежит в localStorage)
    hiddenColumns: Set<BanlistEntryColumnKey>;
    isVisible: (key: BanlistEntryColumnKey) => boolean;
    toggleColumn: (key: BanlistEntryColumnKey) => void;
    showAll: () => void;
    visibleCount: number;
}

// Храним именно СКРЫТЫЕ колонки: колонка, добавленная в таблицу позже,
// останется видимой у пользователей со старым сохранённым выбором.
function loadHiddenColumns(): Set<BanlistEntryColumnKey> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();

        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return new Set();

        return new Set(
            parsed.filter((key): key is BanlistEntryColumnKey =>
                BANLIST_ENTRY_COLUMN_KEYS.includes(key as BanlistEntryColumnKey)
            )
        );
    } catch {
        return new Set();
    }
}

// Видимость колонок таблицы записей бана. Выбор сохраняется в localStorage
// этого браузера, поэтому переживает перезагрузку и переходы между банлистами.
export const useBanlistEntryColumns = (): UseBanlistEntryColumnsResult => {
    const [hiddenColumns, setHiddenColumns] =
        useState<Set<BanlistEntryColumnKey>>(loadHiddenColumns);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...hiddenColumns]));
    }, [hiddenColumns]);

    const toggleColumn = useCallback((key: BanlistEntryColumnKey) => {
        setHiddenColumns((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }, []);

    const showAll = useCallback(() => setHiddenColumns(new Set()), []);

    const isVisible = useCallback(
        (key: BanlistEntryColumnKey) => !hiddenColumns.has(key),
        [hiddenColumns]
    );

    return useMemo(
        () => ({
            hiddenColumns,
            isVisible,
            toggleColumn,
            showAll,
            visibleCount: BANLIST_ENTRY_COLUMN_KEYS.length - hiddenColumns.size,
        }),
        [hiddenColumns, isVisible, toggleColumn, showAll]
    );
};
