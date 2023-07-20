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
  const lang = language.languageRepository;
  return (
    <div className="map-flags">
      {hasCheats && (
        <Label color="red">{lang.mapflagHasCheatPack}</Label>
      )}
      {sematicCheckError && (
        <Label color="red">{lang.scriptHasSemanticErrors}</Label>
      )}
      {statsType && (
        <Label>
          {lang.statsType}: {statsType}
        </Label>
      )}
      {hclSupport && <Label>{lang.hclSupport}</Label>}
    </div>
  );
}

export default memo(MapFlags);
