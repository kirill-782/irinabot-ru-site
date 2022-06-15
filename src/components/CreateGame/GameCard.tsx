import { Button, Item } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import "./CreateGame.scss";

/** Карточка игры в dropdown */
export const GameCard: React.FC<
  Map & { onClick?(): void; selected: boolean }
> = ({ mapInfo, fileName, fileSize, onClick, selected }) => {
  const { mapImageUrl, coverImageUrl, author, name, description } = mapInfo!;

  return (
    <Item>
      <Item.Image size="tiny" src={coverImageUrl || mapImageUrl} />

      <Item.Content>
        <Item.Header as="a">{name}</Item.Header>
        <Item.Meta>{author}</Item.Meta>
        <Item.Extra>
          <div>
            <Button type="button" floated="right" onClick={onClick}>
              {selected ? "Выбрать другую карту " : "Выбрать"}
            </Button>

            <div>
              {fileName} ({fileSize})
            </div>
            <Item.Extra className="map-description">{description}</Item.Extra>
          </div>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};
