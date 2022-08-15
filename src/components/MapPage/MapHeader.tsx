import { Grid, Header, Image } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import WarcraftIIIText from "../WarcraftIIIText";

function MapHeader({mapInfo, id}: Map) {
  return (
    <>
      <Grid.Column width={3}>
        {mapInfo?.coverImageUrl && (
          <Image src={mapInfo?.coverImageUrl} />
        )}
      </Grid.Column>
      <Grid.Column width={10}>
        <Header>
          <WarcraftIIIText>{mapInfo?.name}</WarcraftIIIText>
          <u>#{id}</u>
        </Header>
        <p>
          <WarcraftIIIText>{mapInfo?.description}</WarcraftIIIText>
        </p>
        <p>
          <b>Автор: </b>
          <WarcraftIIIText>{mapInfo?.author}</WarcraftIIIText>
        </p>
        <p>
          <b>Рекомендации к игрокам: </b>
          <WarcraftIIIText>
            {mapInfo?.playerRecommendation}
          </WarcraftIIIText>
        </p>
      </Grid.Column>
      <Grid.Column width={3}>
        {mapInfo?.mapImageUrl && (
          <Image src={mapInfo?.mapImageUrl} />
        )}
      </Grid.Column>
    </>
  );
}

export default MapHeader;
