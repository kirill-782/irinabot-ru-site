import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Grid, Loader, Message } from "semantic-ui-react";
import {
  AppRuntimeSettingsContext,
  MapContext,
  RestContext,
} from "../../context";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import { Map } from "../../models/rest/Map";
import MapEditPageContent from "../MapEditPage";

function MapEditPage() {
  const { id } = useParams();
  const { mapsApi } = useContext(RestContext);

  const [mapData, setMapData] = useState<Map | null>(null);
  const [isMapLoading, setMapLoading] = useState<boolean>(false);
  const [mapLoadErrorMessage, setMapLoadErrorMessage] = useState<string>("");

  const mapLoadRef = useRef<AbortController | null>();

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  const reloadMap = useMemo(() => {
    return () => {
      if (mapLoadRef.current) mapLoadRef.current.abort();

      mapLoadRef.current = new AbortController();

      setMapLoading(true);

      mapsApi
        .getMapInfo(parseInt(id!!), { signal: mapLoadRef.current.signal })
        .then((map) => {
          setMapData(map);
        })
        .catch((e) => {
          if (e.message === "canceled") return;
          setMapLoadErrorMessage(convertErrorResponseToString(e));
        })
        .finally(() => {
          mapLoadRef.current = null;
          setMapLoading(false);
        });
    };
  }, [mapsApi, id]);

  useEffect(() => {
    reloadMap();
  }, [id, reloadMap]);

  return (
    <Container>
      {mapLoadErrorMessage && (
        <Message error>
          <p>{mapLoadErrorMessage}</p>
        </Message>
      )}
      {mapData ? (
        <MapContext.Provider
          value={{
            map: mapData,
            setMap: () => {},
          }}
        >
          <MapEditPageContent updateMap={reloadMap} />
        </MapContext.Provider>
      ) : (
        <Loader active size="big">
          {t("page.map.edit.loading")}
        </Loader>
      )}
    </Container>
  );
}

export default MapEditPage;
