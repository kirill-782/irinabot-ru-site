import { useCallback, useMemo, useState } from "react";
import { BanlistAction, BanlistEntriesQueryParams } from "../models/rest/Banlist";
import { useDebounce } from "./useDebounce";

// поиск отправляется на сервер; печать дебаунсим, чтобы не дёргать API на каждый символ
const SEARCH_DEBOUNCE_MS = 350;

export type BanlistEntriesActionFilter = "all" | BanlistAction;

export type BanlistEntriesStatusFilter = "all" | "active" | "expired" | "deferred";

// сентинел «без шаблона» для дропдауна шаблонов
export const TEMPLATE_FILTER_NONE = -1;

const DEFAULT_PAGE_SIZE = 20;

// варианты размера страницы (count ограничен спецификацией: max 200)
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200];

export interface UseBanlistEntriesFilterResult {
    // серверный поиск по субъекту (userId/ник), уходит в query (с дебаунсом)
    search: string;
    setSearch: (value: string) => void;
    actionFilter: BanlistEntriesActionFilter;
    setActionFilter: (value: BanlistEntriesActionFilter) => void;
    statusFilter: BanlistEntriesStatusFilter;
    setStatusFilter: (value: BanlistEntriesStatusFilter) => void;
    templateFilter: number | "all";
    setTemplateFilter: (value: number | "all") => void;
    tagFilter: string;
    setTagFilter: (value: string) => void;
    page: number;
    setPage: (value: number) => void;
    pageSize: number;
    setPageSize: (value: number) => void;
    // серверные query-параметры (включая дебаунснутый поиск)
    params: BanlistEntriesQueryParams;
}

export const useBanlistEntriesFilter = (): UseBanlistEntriesFilterResult => {
    const [search, setSearchState] = useState("");
    const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
    const [actionFilter, setActionFilterState] = useState<BanlistEntriesActionFilter>("all");
    const [statusFilter, setStatusFilterState] = useState<BanlistEntriesStatusFilter>("all");
    const [templateFilter, setTemplateFilterState] = useState<number | "all">("all");
    const [tagFilter, setTagFilterState] = useState<string>("all");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

    // любой серверный фильтр меняет выборку — возвращаемся на первую страницу
    const setSearch = useCallback((value: string) => {
        setSearchState(value);
        setPage(0);
    }, []);

    const setActionFilter = useCallback((value: BanlistEntriesActionFilter) => {
        setActionFilterState(value);
        setPage(0);
    }, []);

    const setStatusFilter = useCallback((value: BanlistEntriesStatusFilter) => {
        setStatusFilterState(value);
        setPage(0);
    }, []);

    const setTemplateFilter = useCallback((value: number | "all") => {
        setTemplateFilterState(value);
        setPage(0);
    }, []);

    const setTagFilter = useCallback((value: string) => {
        setTagFilterState(value);
        setPage(0);
    }, []);

    // смена размера страницы меняет разбивку — начинаем с первой страницы
    const setPageSize = useCallback((value: number) => {
        setPageSizeState(value);
        setPage(0);
    }, []);

    const params = useMemo<BanlistEntriesQueryParams>(() => {
        const result: BanlistEntriesQueryParams = {
            offset: page * pageSize,
            count: pageSize,
        };

        if (actionFilter !== "all") result.action = actionFilter;
        if (statusFilter !== "all") result.status = statusFilter;

        if (templateFilter === TEMPLATE_FILTER_NONE) {
            result.hasTemplate = false;
        } else if (templateFilter !== "all") {
            result.templateId = templateFilter;
        }

        if (tagFilter !== "all") result.tag = tagFilter;

        const trimmedSearch = debouncedSearch.trim();
        if (trimmedSearch) result.query = trimmedSearch;

        return result;
    }, [actionFilter, statusFilter, templateFilter, tagFilter, debouncedSearch, page, pageSize]);

    return {
        search,
        setSearch,
        actionFilter,
        setActionFilter,
        statusFilter,
        setStatusFilter,
        templateFilter,
        setTemplateFilter,
        tagFilter,
        setTagFilter,
        page,
        setPage,
        pageSize,
        setPageSize,
        params,
    };
};
