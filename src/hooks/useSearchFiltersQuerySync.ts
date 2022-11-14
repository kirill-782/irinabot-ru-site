import { SearchFilters, SearchOrder } from "../models/rest/SearchFilters";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usePrevious from "./usePrevious";

export const useSearchFiltersQuerySync = (
  filters: [SearchFilters | null, SearchOrder | null],
  setFilters: (filters: [SearchFilters | null, SearchOrder | null]) => void
) => {
  const search = useLocation().search;
  const oldSearch = usePrevious(search);

  const navigate = useNavigate();

  useEffect(() => {
    if (search !== oldSearch) {
      const queryParser = new URLSearchParams(search);

      const newFilters: [SearchFilters | null, SearchOrder | null] = [
        {
          verify: toBoolean(queryParser.get("verify")),
          taggedOnly: toBoolean(queryParser.get("taggedOnly")),
          favorite: toBoolean(queryParser.get("favorite")),
          minPlayers: toInt(queryParser.get("minPlayers")),
          maxPlayers: toInt(queryParser.get("maxPlayers")),
          category: toInt(queryParser.get("category")),
          owner: queryParser.get("owner") || undefined,
        },
        {
          sortBy: queryParser.get("sortBy") || undefined,
          orderBy: queryParser.get("orderBy") || undefined,
        },
      ];

      if (!Object.values(newFilters[0]).some((i) => i !== undefined)) {
        newFilters[0] = null;
      }

      if (!Object.values(newFilters[1]).some((i) => i !== undefined)) {
        newFilters[1] = null;
      }

      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
        setFilters(newFilters);
      }
    } else {
      const queryParser = new URLSearchParams(search);

      updateParam(queryParser, "verify", filters[0]?.verify?.toString());
      updateParam(
        queryParser,
        "taggedOnly",
        filters[0]?.taggedOnly?.toString()
      );
      updateParam(queryParser, "favorite", filters[0]?.favorite?.toString());
      updateParam(
        queryParser,
        "minPlayers",
        filters[0]?.minPlayers?.toString()
      );
      updateParam(
        queryParser,
        "maxPlayers",
        filters[0]?.maxPlayers?.toString()
      );
      updateParam(queryParser, "category", filters[0]?.category?.toString());
      updateParam(queryParser, "owner", filters[0]?.owner?.toString());
      updateParam(queryParser, "sortBy", filters[1]?.sortBy?.toString());
      updateParam(queryParser, "orderBy", filters[1]?.orderBy?.toString());

      if (search.substring(1) !== queryParser.toString()) {
        navigate("?" + queryParser.toString(), { state: {} });
      }
    }
  }, [search, filters]);
};

const updateParam = (
  queryParser: URLSearchParams,
  key: string,
  value?: string
) => {
  if (value === undefined || value === null) {
    queryParser.delete(key);
  } else {
    queryParser.set(key, value);
  }
};

const toBoolean = (value?: string) => {
  if (!value) return undefined;

  return value === "true";
};

const toInt = (value?: string) => {
  if (isNaN(parseInt(value))) return undefined;

  return parseInt(value);
};
