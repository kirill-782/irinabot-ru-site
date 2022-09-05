import React, { useState } from "react";
import { Button, Grid, Item, Image, Header } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import "./MapCard.scss";
import { Link } from "react-router-dom";
import WarcraftIIIText from "../WarcraftIIIText";
import MapStatusIcons from "../MapStatusIcons";
import MapCategoryList from "../MapPage/MapCategoryList";
import MapDownloadButton from "../MapPage/MapDownloadButton";

/** Карточка игры в dropdown */
export const GameCard: React.FC<Map & { selectElement?: React.ReactNode }> = ({
  mapInfo,
  fileName,
  fileSize,
  selectElement,
  id,
  categories,
  downloadUrl,
  ...map
}) => {
  const { mapImageUrl, coverImageUrl, author, name, description } = mapInfo!;

  const [fullText, setFullText] = useState(false);

  let displayDesctiption = description;
  let needFulltextLink = false;

  if (!fullText && description?.length && description?.length > 500) {
    displayDesctiption = description?.substring(0, 500) + "...";

    needFulltextLink = true;
  }

  return (
    <Grid className="map-card" stackable>
      <Grid.Column width={2}>
        <Image size="medium" src={coverImageUrl || mapImageUrl} />
      </Grid.Column>

      <Grid.Column width={11}>
        <Header as={Link} to={`/maps/${id}`}>
          <WarcraftIIIText>{name}</WarcraftIIIText>
          <MapStatusIcons {...map} />
        </Header>
        <div className="author">
          <WarcraftIIIText>{author}</WarcraftIIIText>
        </div>
        <Grid.Row className="description">
          <WarcraftIIIText>{displayDesctiption}</WarcraftIIIText>
          {needFulltextLink && (
            <a
              className="full-description"
              onClick={() => {
                setFullText(true);
              }}
            >
              Показать весь текст
            </a>
          )}
        </Grid.Row>
        <Grid.Row className="categories">
          <MapCategoryList categories={categories} />
        </Grid.Row>
      </Grid.Column>
      <Grid.Column className="action-buttons" width={3}>
        <Grid.Row>
          {selectElement}
          {downloadUrl && (
            <MapDownloadButton
              downloadUrl={downloadUrl}
              fileSize={fileSize}
              fileName={fileName}
            />
          )}
        </Grid.Row>
      </Grid.Column>
    </Grid>
  );
};
