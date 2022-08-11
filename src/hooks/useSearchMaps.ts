import { useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { Map } from "../models/rest/Map";
import { SearchFilters } from "../models/rest/SearchFilters";
import { convertErrorResponseToString } from "../utils/ApiUtils";

const PAGE_SIZE = 20;

export const useSearchMaps = (
  filters: SearchFilters | null,
  q?: string
): [Map[], boolean, boolean, string, () => void] => {
  const [searchedMaps, setSearchedMaps] = useState<Map[] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isFull, setFull] = useState<boolean>(false);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { mapsApi } = useContext(RestContext);

  const searchMaps = (value: string, filters: SearchFilters, page: number) => {
    if (value.length < 2 && !filters) return;

    setLoading(true);

    if (!page) setSearchedMaps([]);

    setErrorMessage("Error");
    mapsApi
      .searchMap(filters, value.length >= 2 ? value : undefined, {
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
    if (!isFull && !isLoading && (q || filters))
      searchMaps(q, filters || {}, currentPage + 1);
  };

  useEffect(() => {
    if (q || filters) {
      const timer = setTimeout(() => {
        searchMaps(q, filters || {}, 0);
      }, 300);

      return () => clearTimeout(timer);
    } else setSearchedMaps(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filters, mapsApi]);

  return [searchedMaps, isFull, isLoading, errorMessage, loadNextPage];
};
