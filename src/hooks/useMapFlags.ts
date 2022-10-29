import { useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { Flags } from "../models/rest/Flags";
import { convertErrorResponseToString } from "../utils/ApiUtils";

interface useMapFlagsParams {
  mapId: number;
}

export const useMapFlags = ({
  mapId,
}: useMapFlagsParams): [
  Flags | undefined,
  (flags: Flags) => void,
  boolean,
  string
] => {
  const [flags, setFlags] = useState<Flags>();
  const [flagsLoading, setFlagsLoading] = useState<boolean>(false);
  const [flagsLoadError, setFlagsLoadError] = useState<string>("");

  const { mapsApi } = useContext(RestContext);

  const updateFlags = (flags: Flags) => {
    setFlagsLoading(true);
    mapsApi
      .patchMapFlags(mapId, flags)
      .then((flags) => {
        setFlags(flags);
      })
      .finally(() => {
        setFlagsLoading(false);
      });
  };

  useEffect(() => {
    setFlagsLoading(true);
    setFlagsLoadError("");
    setFlags(undefined);

    mapsApi
      .getMapFlags(mapId)
      .then((e) => {
        setFlags(e);
      })
      .catch((e) => {
        setFlagsLoadError(convertErrorResponseToString(e));
      })
      .finally(() => {
        setFlagsLoading(false);
      });
  }, [mapId, mapsApi]);

  return [flags, updateFlags, flagsLoading, flagsLoadError];
};
