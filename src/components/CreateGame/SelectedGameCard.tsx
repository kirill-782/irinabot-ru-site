import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  DropdownItemProps,
  DropdownProps,
  Form,
  Grid,
  InputOnChangeData,
  Item,
} from "semantic-ui-react";
import { RestContext } from "../../context";
import "./CreateGame.scss";
import { GameCardProps } from "./interfaces";

const assemblyMapOptions = (
  mapFlags: number,
  mapSpeed: number,
  mapVisibility: number,
  mapObservers: number
): number => {
  return (
    mapFlags | ((mapSpeed | (mapVisibility << 2) | (mapObservers << 5)) << 8)
  );
};

const assemblyMapFlags = (
  mapFlagTeamsTogether,
  mapFlagFixedTeams,
  mapFlagUnitShare,
  mapFlagRandomHero,
  mapFlagRandomRaces
) => {
  return (
    mapFlagTeamsTogether * 1 +
    mapFlagFixedTeams * 2 +
    mapFlagUnitShare * 4 +
    mapFlagRandomHero * 8 +
    mapFlagRandomRaces * 16
  );
};

/** Карточка игры в dropdown */
export const SelectedGameCard: React.FC<GameCardProps> = ({
  map,
  onClick,
  mapFlagFixedTeams,
  mapFlagRandomHero,
  mapFlagRandomRaces,
  mapFlagTeamsTogether,
  mapFlagUnitShare,
  mapSpeed,
  mapVisibility,
  mapObservers,
  selected,
  patches,
}) => {
  const [canCreateGame, setCanCreateGame] = useState(false);
  const [selectedPatch, setSelectedPatch] = useState<
    DropdownItemProps | undefined
  >(patches[0]);
  const [mapName, setMapName] = useState("");
  const { mapsApi } = useContext(RestContext);
  const [errorMessage, setErrorMessage] = useState("");

  const { mapInfo, fileName, fileSize } = map;
  const { mapImageUrl, coverImageUrl, author, name, description } = mapInfo!;

  const handleCreateGame = (ev: React.SyntheticEvent) => {
    console.log("name", mapName);
    console.log("map", map);
    console.log("patch", selectedPatch);
    const mapFlags = assemblyMapFlags(
      mapFlagTeamsTogether,
      mapFlagFixedTeams,
      mapFlagUnitShare,
      mapFlagRandomHero,
      mapFlagRandomRaces
    );
    console.log("FLAGS", mapFlags);
    console.log(
      "mapSpeed",
      mapSpeed,
      "mapVisibility",
      mapVisibility,
      "mapObservers",
      mapObservers
    );
    console.log(
      "map options",
      assemblyMapOptions(mapFlags, mapSpeed, mapVisibility, mapObservers)
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setCanCreateGame(true);
      setErrorMessage("");
    }, []);

    const mapId: number | undefined = map?.id;
    const patch: string = selectedPatch?.value as string;

    if (mapId && patch)
      mapsApi.getMapInfo(mapId).then((mapRes) => {
        const matchConfigInfo = mapRes?.configs?.find(
          (el) => el.version === patch
        );
        if (matchConfigInfo?.status === 1) {
          mapsApi.getMapConfig(mapId, patch).then((res) => {
            console.log("send config", res);
          });
        }
        console.log("map config", mapRes);
      });

    ev.preventDefault();
    return false;
  };

  const handleMapNameChange = (_, { value }: InputOnChangeData) => {
    setMapName(value);
  };

  const handlePatchChange = (_, { value }: DropdownProps) => {
    setSelectedPatch(patches.find((el) => el.value === value));
  };

  return (
    <>
      <Form>
        <Form.Group widths="equal">
          <Form.Input
            fluid
            name="name"
            label="Название игры"
            placeholder="Название игры"
            value={mapName}
            onChange={handleMapNameChange}
          />
          <Form.Select
            fluid
            name="patch"
            label="Патч"
            onChange={handlePatchChange}
            options={patches}
            value={selectedPatch?.value}
          />
        </Form.Group>
      </Form>
      <Item>
        <Item.Image size="tiny" src={coverImageUrl || mapImageUrl} />

        <Item.Content>
          <Item.Header as="a">{name}</Item.Header>
          <Item.Meta>{author}</Item.Meta>
          <Item.Extra>
            <Grid>
              <Grid.Row>
                <Button type="button" floated="right" onClick={onClick}>
                  {selected ? "Выбрать другую карту " : "Выбрать"}
                </Button>

                <div>
                  {fileName} ({fileSize})
                </div>
                <Item.Extra className="map-description">
                  {description}
                </Item.Extra>
              </Grid.Row>
              <Grid.Row>
                <Button
                  role="button"
                  type="button"
                  onClick={handleCreateGame}
                  disabled={canCreateGame}
                >
                  Создать
                </Button>
              </Grid.Row>
              <Grid.Row>{errorMessage}</Grid.Row>
            </Grid>
          </Item.Extra>
        </Item.Content>
      </Item>
    </>
  );
};
