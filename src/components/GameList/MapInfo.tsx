import { memo, useContext, useState } from "react";
import { Map } from "../../models/rest/Map";
import { useEffect } from "react";
import { RestContext } from "../../context";
import { Container, Icon, Loader, Image } from "semantic-ui-react";
import { parseWC3Tags } from "../../utils/WC3TestUtils";
import "./MapInfo.scss"

interface MapInfoProps {
  mapId: number;
}

function MapInfo({ mapId }: MapInfoProps) {
  const [mapInfo, setMapInfo] = useState<Map | null>(null);
  const [isLoading, setLoading] = useState<Boolean>(true);
  const [hasError, setError] = useState<Boolean>(false);
  const { mapsApi } = useContext(RestContext);

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
        console.log(e);
      });
  }, [mapId]);

  if (isLoading)
    return (
      <Loader active size="big">
        Загрузка
      </Loader>
    );

  if (hasError)
    return (
      <div className="map-info-error">
        <Icon size="big" color="red" name="close"></Icon>
        <span className="text">Ошибка</span>
      </div>
    );

  return (
    <Container className="map-info">
      <h3 className="map-title" dangerouslySetInnerHTML={{
          __html: parseWC3Tags(mapInfo?.mapInfo?.name || ""),
        }}
      ></h3>
      <Image src={mapInfo?.mapInfo?.coverImageUrl || mapInfo?.mapInfo?.mapImageUrl} />
      <div>
        <span className="map-players-title">Кол-во игроков:</span>
        <span dangerouslySetInnerHTML={{
            __html: parseWC3Tags(mapInfo?.mapInfo?.playerRecommendation || ""),
          }}></span>
        <div dangerouslySetInnerHTML={{
            __html: parseWC3Tags(mapInfo?.mapInfo?.description || ""),
          }}
        ></div>
      </div>
    </Container>
  );
}

export default memo(MapInfo);