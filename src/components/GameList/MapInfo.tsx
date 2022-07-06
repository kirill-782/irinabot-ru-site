import { useContext, useState } from "react";
import { Map } from "../../models/rest/Map";
import { useEffect } from "react";
import { RestContext } from "../../context";
import { Container, Icon, Loader } from "semantic-ui-react";

interface MapInfoProps {
  mapId: number;
}

function MapInfo({ mapId }: MapInfoProps) {
  const [mapInfo, setMapInfo] = useState<Map | null>(null);
  const [isLoading, setLoading] = useState<Boolean>(true);
  const [hasError, setError] = useState<Boolean>(false);
  const { mapsApi } = useContext(RestContext);

  console.log("qwerty");

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
      <Icon size="big" color="red" name="close">
        Ошибка
      </Icon>
    );

  return (
    <div style={{ position: "sticky", top: "50px" }}>
      <p style={{ textAlign: "center", fontWeight: 600 }}>
        {mapInfo?.mapInfo?.name}
      </p>
      <img
        style={{ border: "solid blue 2px;", width: 256, height: 256 }}
        src={mapInfo?.mapInfo?.coverImageUrl || mapInfo?.mapInfo?.mapImageUrl}
      />
      <p>
        <b>Кол-во игроков:</b> <span>{mapInfo?.mapInfo?.numPlayers}</span>
      </p>
      <p>{mapInfo?.mapInfo?.description}</p>
    </div>
  );
}

export default MapInfo;
