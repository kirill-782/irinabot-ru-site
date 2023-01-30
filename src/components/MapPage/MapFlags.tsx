import React, { memo, useContext } from "react";
import {
  Container,
  Grid,
  Header,
  Label,
  List,
  Segment,
} from "semantic-ui-react";
import { AppRuntimeSettingsContext, MapContext } from "../../context";
import "./MapFlags.scss";

function MapFlags() {
  const {
    mapDescription,
    hasCheats,
    statsType,
    hclSupport,
    sematicCheckError,
    ...otherFlags
  } = useContext(MapContext).map.additionalFlags || {};

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  return (
    <div className="map-flags">
      {hasCheats && (
        <Label color="red">{t("page.map.flags.hasCheatPack")}</Label>
      )}
      {sematicCheckError && (
        <Label color="red">{t("page.map.flags.scriptHasSemanticErrors")}</Label>
      )}
      {statsType && (
        <Label>
          {t("page.map.flags.statsType")}: {statsType}
        </Label>
      )}
      {hclSupport && <Label>{t("page.map.flags.hclSupport")}</Label>}
    </div>
  );
}

export default memo(MapFlags);
