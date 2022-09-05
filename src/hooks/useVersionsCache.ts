import { useCallback, useContext } from "react";
import { RestContext } from "../context";
import { useState } from "react";
import { MapService } from "../services/MapService";

export const useVersionsCache = (
  mapsApi: MapService
): [string[], () => void] => {
  const [isLoading, setLoading] = useState(false);
  const [versions, setVersions] = useState<string[]>([]);

  const load = useCallback(() => {
    if (!isLoading && versions.length === 0) {
      setLoading(true);
      mapsApi
        .getVersions()
        .then(setVersions)
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isLoading, versions, mapsApi]);

  return [versions, load];
};
