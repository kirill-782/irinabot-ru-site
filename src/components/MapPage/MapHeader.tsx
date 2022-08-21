import React from "react";
import { memo } from "react";
import { Grid, Header, Image } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import MapStatusIcons from "../MapStatusIcons";
import WarcraftIIIText from "../WarcraftIIIText";

function MapHeader({...map}: Map) {
  return (
    <>
      <Grid.Column width={3}>
        {map.mapInfo?.coverImageUrl && (
          <Image src={map.mapInfo?.coverImageUrl} />
        )}
      </Grid.Column>
      <Grid.Column width={10}>
        <Header>
          <WarcraftIIIText>{map.mapInfo?.name}</WarcraftIIIText>
          <u>#{map.id}</u><MapStatusIcons {...map} />
        </Header>
        <p>
          <WarcraftIIIText>{map.mapInfo?.description}</WarcraftIIIText>
        </p>
        <p>
          <b>Автор: </b>
          <WarcraftIIIText>{map.mapInfo?.author}</WarcraftIIIText>
        </p>
        <p>
          <b>Рекомендации к игрокам: </b>
          <WarcraftIIIText>
            {map.mapInfo?.playerRecommendation}
          </WarcraftIIIText>
        </p>
      </Grid.Column>
      <Grid.Column width={3}>
        {map.mapInfo?.mapImageUrl && (
          <Image src={map.mapInfo?.mapImageUrl} />
        )}
      </Grid.Column>
    </>
  );
}

export default memo(MapHeader);
