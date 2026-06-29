import { useCallback, useEffect, useState } from "react";

export interface UsePaginationResult {
    // 0-базовый номер страницы
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
    setPageSize: (pageSize: number) => void;
}

// Состояние оффсетной пагинации: страница + размер. Смена размера возвращает
// на первую страницу. Вызывается до построения query-параметров, поэтому не
// зависит от данных выборки — откат пустой страницы вынесен в useClampPage.
export const usePagination = (initialPageSize = 20): UsePaginationResult => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSizeState] = useState(initialPageSize);

    const setPageSize = useCallback((value: number) => {
        setPageSizeState(value);
        setPage(0);
    }, []);

    return { page, setPage, pageSize, setPageSize };
};

export interface UseClampPageOptions {
    page: number;
    setPage: (page: number) => void;
    total: number;
    pageSize: number;
    // число элементов на текущей странице
    currentCount: number;
    isLoading: boolean;
}

// Откат на последнюю доступную страницу, если текущая «уехала» за пределы
// выборки (например, удалили последнюю запись на странице). Вызывается после
// загрузки, когда известны total и число элементов страницы.
export const useClampPage = (options: UseClampPageOptions) => {
    const { page, setPage, total, pageSize, currentCount, isLoading } = options;

    const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);

    useEffect(() => {
        if (!isLoading && total > 0 && page > lastPage && currentCount === 0) {
            setPage(lastPage);
        }
    }, [isLoading, total, lastPage, currentCount, page, setPage]);
};
