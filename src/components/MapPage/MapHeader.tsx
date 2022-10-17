import React from "react";
import { memo } from "react";
import { Grid, Header, Image } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import { getBotFileName } from "../../utils/MapFileUtils";
import LazyLoadedImage from "../LazyLoadedImage";
import MapStatusIcons from "../MapStatusIcons";
import WarcraftIIIText from "../WarcraftIIIText";

function MapHeader({ ...map }: Map) {
  return (
    <>
      <Grid.Column className="cover-image" width={3}>
        {map.mapInfo?.coverImageUrl && (
          <LazyLoadedImage
            size="medium"
            centered
            blured={map?.additionalFlags?.["nsfw_images"]}
            src={map.mapInfo?.coverImageUrl}
          />
        )}
      </Grid.Column>
      <Grid.Column width={10}>
        <Header>
          <WarcraftIIIText>{map.mapInfo?.name}</WarcraftIIIText>
          <u>#{map.id}</u>
          <MapStatusIcons {...map} />
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
          <WarcraftIIIText>{map.mapInfo?.playerRecommendation}</WarcraftIIIText>
        </p>
        <p>
          <b>Имя загруженного файла: </b> {map.fileName}
        </p>
        <p>
          <b>Имя файла на боте: </b>
          {getBotFileName(map.fileName || "", map.id || 0)}
        </p>
      </Grid.Column>
      <Grid.Column width={3}>
        {map.mapInfo?.mapImageUrl && (
          <LazyLoadedImage
            className="map-image"
            centered
            size="medium"
            blured={map?.additionalFlags?.["nsfw_images"]}
            src={map.mapInfo?.mapImageUrl}
          />
        )}
      </Grid.Column>
    </>
  );
}

export default memo(MapHeader);
