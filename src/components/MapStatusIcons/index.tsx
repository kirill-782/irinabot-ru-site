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
        title={lang.mapStatusIconFavoriteHint}
      />
    );
  }

  if (verified) {
    return (
      <Icon
        className="status-icon"
        name="check"
        color="green"
        title={lang.mapStatusIconVerifyHint}
      />
    );
  }

  if (additionalFlags?.hasCheats) {
    return (
      <Icon
        className="status-icon"
        name="warning"
        color="red"
        title={lang.mapStatusIconCheatHint}
      />
    );
  }

  if (semanticCheckError) {
    return (
      <Icon
        className="status-icon"
        name="warning"
        color="red"
        title={lang.mapStatusIconSemanticHint}
      />
    );
  }

  return null;
}

export default MapStatusIcons;
