import { useContext, useEffect, useState } from "react";
import { RestContext } from "../context";
import { Map } from "../models/rest/Map";

export function useDefaultMaps() {
  const [defalutMaps, setDefaultMaps] = useState<Map[]>([]);

  const { mapsApi } = useContext(RestContext);

  useEffect(() => {
    mapsApi.getMaps().then((res) => setDefaultMaps(res));
  }, [mapsApi]);

  return defalutMaps;
}
