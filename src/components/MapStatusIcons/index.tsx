import React, { useContext } from "react";
import { Icon } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { Map } from "../../models/rest/Map";
import "./MapStatusIcons.scss";

function MapStatusIcons({
  verified,
  additionalFlags,
  semanticCheckError,
  favorite,
}: Map) {
  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  if (favorite) {
    return (
      <Icon
        className="status-icon"
        name="star"
        color="orange"
        title={lang.iconFavour}
      />
    );
  }

  if (verified) {
    return (
      <Icon
        className="status-icon"
        name="check"
        color="green"
        title={lang.isVerified}
      />
    );
  }

  if (additionalFlags?.hasCheats) {
    return (
      <Icon
        className="status-icon"
        name="warning"
        color="red"
        title={lang.iconCheatPack}
      />
    );
  }

  if (semanticCheckError) {
    return (
      <Icon
        className="status-icon"
        name="warning"
        color="red"
        title={lang.page_map_status_icon_semanticError}
      />
    );
  }

  return null;
}

export default MapStatusIcons;
