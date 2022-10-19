import React, { memo, useContext } from "react";
import {
  Container,
  Grid,
  Header,
  Label,
  List,
  Segment,
} from "semantic-ui-react";
import { MapContext } from "../../context";
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

  return (
    <div className="map-flags">
      {hasCheats && <Label color="red">Карта содержит читпак</Label>}
      {sematicCheckError && (
        <Label color="red">Скрипт карты содержит семантические ошибки</Label>
      )}
      {statsType && <Label>Тип статистики: {statsType}</Label>}
      {hclSupport && <Label>Карта поддерживает HCL</Label>}
    </div>
  );
}

export default memo(MapFlags);
