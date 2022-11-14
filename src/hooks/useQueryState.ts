import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const useQueryState = (
  query: string
): [string | undefined, (query?: string | null) => void] => {
  const location = useLocation();
  const go = useNavigate();

  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const urlParams = new URLSearchParams(location.search);

  const setQuery = useCallback(
    (value) => {
      const urlParams = new URLSearchParams(locationRef.current.search);

      let current = urlParams.get(query);

      if (current === null) current = undefined;

      if (current !== value) {
        if (value === undefined || value === null) urlParams.delete(query);
        else urlParams.set(query, value);

        go(`?${urlParams.toString()}`);
      }
    },
    [query]
  );

  return [urlParams.has(query) ? urlParams.get(query) : undefined, setQuery];
};
