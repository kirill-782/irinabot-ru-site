import { memo } from "react";
import { Container, Grid, Header, List, Segment } from "semantic-ui-react";
import MapDescription from "./MapDescription";

function MapFlags({
  mapDescription,
  hasCheats,
  statsType,
  hclSupport,
  ...otherFlags
}: {
  [key: string]: any;
}) {
  return (
    <>
      <Header>Флаги карты</Header>
      <Container>
        <List as="ol">
          {hasCheats && (
            <List.Item style={{ color: "red" }} as="li" value="*">
              Карта сожержит читпак
            </List.Item>
          )}
          {statsType && (
            <List.Item as="li" value="*">
              Тип статистики: {statsType}
            </List.Item>
          )}
          {hclSupport && (
            <List.Item as="li" value="*">
              Карта поддерживает HCL
            </List.Item>
          )}
        </List>
        {Object.keys(otherFlags).length > 0 && (
          <>
            <Grid.Row>Неизвестные флаги</Grid.Row>
            <Segment>{JSON.stringify(otherFlags)}</Segment>
          </>
        )}
      </Container>
    </>
  );
}

export default memo(MapFlags);
