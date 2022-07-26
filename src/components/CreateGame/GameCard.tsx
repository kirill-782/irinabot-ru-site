import React, { useState } from "react";
import { Button, Item } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import "./CreateGame.scss";

/** Карточка игры в dropdown */
export const GameCard: React.FC<
  Map & { onClick?(): void; selected: boolean }
> = ({ mapInfo, fileName, fileSize, onClick }) => {
  const { mapImageUrl, coverImageUrl, author, name, description } = mapInfo!;

  const [fullText, setFullText] = useState(false);

  let displayDesctiption = description;
  let needFulltextLink = false;

  if (!fullText && description?.length && description?.length > 500) {
    displayDesctiption = description?.substring(0, 500) + "...";

    needFulltextLink = true;
  }

  return (
    <Item>
      <Item.Image size="tiny" src={coverImageUrl || mapImageUrl} />

      <Item.Content>
        <Item.Header as="a">{name}</Item.Header>
        <Item.Meta>{author}</Item.Meta>
        <Item.Extra>
          <div>
            <Button type="button" floated="right" onClick={onClick}>
              Выбрать
            </Button>

            <div>
              {fileName} ({fileSize})
            </div>
            <Item.Extra className="map-description">
              {displayDesctiption}
              {needFulltextLink && (
                <a
                  onClick={() => {
                    setFullText(true);
                  }}
                >
                  Показать весь текст
                </a>
              )}
            </Item.Extra>
          </div>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};
