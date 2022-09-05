import React from "react";
import { Icon } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import "./MapStatusIcons.scss";

function MapStatusIcons({ verified, additionalFlags }: Map) {
  if (verified)
    return (
      <Icon
        className="status-icon"
        name="check"
        color="green"
        title="Карта проверена"
      />
    );

  if (additionalFlags?.hasCheats)
    return (
      <Icon
        className="status-icon"
        name="warning"
        color="red"
        title="В карте найден читпак"
      />
    );

  return null;
}

export default MapStatusIcons;
