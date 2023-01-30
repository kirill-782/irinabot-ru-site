import React, { useContext } from "react";
import { Button } from "semantic-ui-react";
import { MapContext, RestContext } from "../../context";
import { AppRuntimeSettingsContext } from "./../../context/index";
import { toast } from "@kokomi/react-semantic-toasts";
import { convertErrorResponseToString } from "../../utils/ApiUtils";

function MapFavoriteButton() {
  const { map, setMap } = useContext(MapContext);
  const { mapsApi } = useContext(RestContext);

  const favorite = map.favorite;

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  const onButtonClick = () => {
    if (favorite) {
      mapsApi
        .deleteMapFromFavorite(map.id || 0)
        .then(() => {
          setMap({ ...map, favorite: false });
        })
        .catch((e) => {
          toast({
            title: t("page.map.button.favour.error"),
            description: convertErrorResponseToString(e),
          });
        });
    } else {
      mapsApi
        .addMapToFavorite(map.id || 0)
        .then(() => {
          setMap({ ...map, favorite: true });
        })
        .catch((e) => {
          toast({
            title: t("page.map.button.favour.error"),
            description: convertErrorResponseToString(e),
          });
        });
    }
  };

  return (
    <Button
      className="centred"
      icon="star"
      basic
      onClick={onButtonClick}
      color={favorite ? "orange" : undefined}
    />
  );
}

export default MapFavoriteButton;
