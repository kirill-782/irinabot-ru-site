import React, { memo } from "react";
import {
  Container,
  Grid,
  Header,
  Label,
  List,
  Segment,
} from "semantic-ui-react";
import "./MapFlags.scss";

function MapFlags({
  mapDescription,
  hasCheats,
  statsType,
  hclSupport,
  sematicCheckError,
  ...otherFlags
}: {
  [key: string]: any;
}) {
  return (
    <div className="map-flags">
      {hasCheats && <Label color="red">Карта содержит читпак</Label>}
      {sematicCheckError && <Label color="red">Скрипт карты содержит семантические ошибки</Label>}
      {statsType && <Label>Тип статистики: {statsType}</Label>}
      {hclSupport && <Label>Карта поддерживает HCL</Label>}
    </div>
  );

  return (
    <Grid className="map-flags">
      <Header>Флаги карты</Header>
      <Grid.Row>
        <Container style={{ width: "100% !important" }}>
          {Object.keys(otherFlags).length > 0 && (
            <>
              <Grid.Row>Неизвестные флаги</Grid.Row>
              <Segment>{JSON.stringify(otherFlags)}</Segment>
            </>
          )}
        </Container>
      </Grid.Row>
    </Grid>
  );
}

export default memo(MapFlags);
