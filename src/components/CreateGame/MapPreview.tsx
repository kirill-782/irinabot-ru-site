import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Grid, Header, Image } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import LazyLoadedImage from "../LazyLoadedImage";
import MapCategoryList from "../MapPage/MapCategoryList";
import MapStatusIcons from "../MapStatusIcons";
import WarcraftIIIText from "../WarcraftIIIText";
import "./MapPreview.scss";

interface MapPreviewProps {
  map: Map;
}

function MapPreview({ map }: MapPreviewProps) {
  return (
    <Grid className="map-preview" stackable>
      <Grid.Column width={4}>
        <LazyLoadedImage
          blured={map?.additionalFlags?.["nsfw_images"]}
          size="medium"
          src={map.mapInfo?.coverImageUrl || map.mapInfo?.mapImageUrl}
        />
      </Grid.Column>

      <Grid.Column width={11}>
        <Header as={Link} to={`/maps/${map.id}`}>
          <WarcraftIIIText>{map.mapInfo?.name}</WarcraftIIIText>
          <MapStatusIcons {...map} />
        </Header>
        <div className="author">
          <WarcraftIIIText>{map.mapInfo?.author}</WarcraftIIIText>
        </div>
        <Grid.Row className="description">
          <WarcraftIIIText>{map.mapInfo?.description}</WarcraftIIIText>
        </Grid.Row>
        <Grid.Row className="categories">
          <MapCategoryList categories={map.categories} />
        </Grid.Row>
      </Grid.Column>
    </Grid>
  );
}

export default memo(MapPreview);
