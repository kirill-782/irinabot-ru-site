import { useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { Map } from "../models/rest/Map";
import { SearchFilters, SearchOrder } from "../models/rest/SearchFilters";
import { convertErrorResponseToString } from "../utils/ApiUtils";

const PAGE_SIZE = 20;

export const isNoFilters = (filters: SearchFilters | null) => {
    if (!filters || !Object.keys(filters).length) return true;

    let found = false;

    Object.keys(filters).forEach((i) => {
        if (filters[i] !== undefined) found = true;
    });

    return !found;
};

export const useSearchMaps = (
    filters: SearchFilters | null,
    order: SearchOrder | null,
    q?: string
): [Map[], boolean, boolean, string, () => void] => {
    const [searchedMaps, setSearchedMaps] = useState<Map[] | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [isFull, setFull] = useState<boolean>(false);

    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const { mapsApi } = useContext(RestContext);

    const searchMaps = (value: string, filters: SearchFilters, order: SearchOrder, page: number) => {
        if (value.length < 2 && isNoFilters(filters)) return;

        setLoading(true);

        if (!page) setSearchedMaps([]);

        setErrorMessage("");
        mapsApi
            .searchMap(filters, order, value.length >= 2 ? value : undefined, {
                count: PAGE_SIZE,
                offset: page * PAGE_SIZE,
            })
            .then((maps) => {
                if (maps.length < PAGE_SIZE) setFull(true);
                else setFull(false);

                setCurrentPage(page);
                setSearchedMaps((searchedMaps) => {
                    if (!searchedMaps || page === 0) return maps;
                    return [...searchedMaps, ...maps];
                });
                setLoading(false);
            })
            .catch((e) => {
                setCurrentPage(0);
                setFull(false);
                setSearchedMaps(null);
                setLoading(false);
                setErrorMessage(convertErrorResponseToString(e));
            });
    };

    const loadNextPage = () => {
        if (!isFull && !isLoading && (q || filters)) searchMaps(q, filters || {}, order || {}, currentPage + 1);
    };

    useEffect(() => {
        if (q || !isNoFilters(filters)) {
            const timer = setTimeout(() => {
                searchMaps(q, filters || {}, order || {}, 0);
            }, 300);

            return () => clearTimeout(timer);
        } else setSearchedMaps(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, filters, order]);

    return [searchedMaps, isFull, isLoading, errorMessage, loadNextPage];
};
