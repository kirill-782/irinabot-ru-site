import { memo, useContext, useState } from "react";
import { Map } from "../../models/rest/Map";
import { useEffect } from "react";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { Container, Icon, Loader, Image, Header } from "semantic-ui-react";
import "./MapInfo.scss";
import WarcraftIIIText from "../WarcraftIIIText";
import MapStatusIcons from "../MapStatusIcons";
import React from "react";
import { Link } from "react-router-dom";
import LazyLoadedImage from "../LazyLoadedImage";

interface MapInfoProps {
  mapId: number;
}

function MapInfo({ mapId }: MapInfoProps) {
  const [mapInfo, setMapInfo] = useState<Map | null>(null);
  const [isLoading, setLoading] = useState<Boolean>(true);
  const [hasError, setError] = useState<Boolean>(false);
  const { mapsApi } = useContext(RestContext);

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  useEffect(() => {
    setLoading(true);
    setError(false);
    mapsApi
      .getMapInfo(mapId)
      .then((result) => {
        setMapInfo(result);
        setLoading(false);
      })
      .catch((e) => {
        setError(true);
        setLoading(false);
      });
  }, [mapId]);

  if (isLoading)
    return (
      <Loader active size="big">
        {lang.loadingDotted}
      </Loader>
    );

  if (hasError)
    return (
      <div className="map-info-error">
        <Icon size="big" color="red" name="close"></Icon>
        <span className="text">{lang.error}</span>
      </div>
    );

  return (
    <Container className="map-info">
      <Header as={Link} to={`/maps/${mapId}`} className="map-title">
        <WarcraftIIIText>{mapInfo?.mapInfo?.name || ""}</WarcraftIIIText>
        <MapStatusIcons {...mapInfo} />
      </Header>
      <LazyLoadedImage
        blured={mapInfo?.additionalFlags?.["nsfw_images"]}
        src={mapInfo?.mapInfo?.coverImageUrl || mapInfo?.mapInfo?.mapImageUrl}
      />
      <div>
        <span className="map-players-title">
          {lang.mapInfoPlayersCount}
        </span>
        <WarcraftIIIText>
          {mapInfo?.mapInfo?.playerRecommendation || ""}
        </WarcraftIIIText>
        <div>
          <WarcraftIIIText>
            {mapInfo?.mapInfo?.description || ""}
          </WarcraftIIIText>
        </div>
      </div>
    </Container>
  );
}

export default memo(MapInfo);
