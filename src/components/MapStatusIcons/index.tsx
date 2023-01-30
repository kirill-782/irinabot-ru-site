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
  const t = language.getString;

  if (favorite) {
    return (
      <Icon
        className="status-icon"
        name="star"
        color="orange"
        title={t("page.map.status.icon.favour")}
      />
    );
  }

  if (verified) {
    return (
      <Icon
        className="status-icon"
        name="check"
        color="green"
        title={t("page.map.status.icon.verified")}
      />
    );
  }

  if (additionalFlags?.hasCheats) {
    return (
      <Icon
        className="status-icon"
        name="warning"
        color="red"
        title={t("page.map.status.icon.cheatPack")}
      />
    );
  }

  if (semanticCheckError) {
    return (
      <Icon
        className="status-icon"
        name="warning"
        color="red"
        title={t("page.map.status.icon.semanticError")}
      />
    );
  }

  return null;
}

export default MapStatusIcons;
