import React, {
  BaseSyntheticEvent,
  useState,
  useContext,
  useEffect,
} from "react";
import {
  Form,
  Grid,
  Header,
  Container,
  Item,
  Divider,
  DropdownItemProps,
  DropdownProps,
  Button,
  InputOnChangeData,
} from "semantic-ui-react";
import { RestContext } from "../../context";
import { SearchFilters } from "../../models/rest/SearchFilters";
import "./CreateGame.scss";
import { GameCard } from "./GameCard";
import { Filters } from "./Filters";
import { Map } from "../../models/rest/Map";

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

const visibilityOptions = [
  { key: "4", text: "По умочланию", value: 4 },
  { key: "1", text: "Скрыта", value: 1 },
  { key: "2", text: "Разведана", value: 2 },
  { key: "3", text: "Открыта", value: 3 },
];

const observersOptions = [
  { key: "1", text: "Нет", value: 1 },
  { key: "3", text: "Все зрители", value: 3 },
  { key: "2", text: "После поражения", value: 2 },
  { key: "4", text: "Судьи", value: 4 },
];

function CreateGame() {
  const [searchedMaps, setSearchedMaps] = useState<Map[]>([]);
  const [defalutMaps, setDefaultMaps] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map>();
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchValue, setSearchValue] = useState("");
  const { mapsApi } = useContext(RestContext);
  const [patchesOption, setPatchesOption] = useState<DropdownItemProps[]>([]);
  const [selectedPatch, setSelectedPatch] = useState<DropdownItemProps>();
  const [canCreateGame, setCanCreateGame] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [mapFlagTeamsTogether, setMapFlagTeamsTogether] = useState(0);
  const [mapFlagFixedTeams, setMapFlagFixedTeams] = useState(0);
  const [mapFlagUnitShare, setMapFlagUnitShare] = useState(0);
  const [mapFlagRandomHero, setMapFlagRandomHero] = useState(0);
  const [mapFlagRandomRaces, setMapFlagRandomRaces] = useState(0);

  const [mapSpeed, setMapSpeed] = useState(0);
  const [mapVisibility, setMapVisibility] = useState(4);
  const [mapObservers, setMapObservers] = useState(1);
  const [mapName, setMapName] = useState("");

  console.log("m", searchedMaps);

  const searchMap = ({ target }: BaseSyntheticEvent) => {
    const value = target.value;
    setSearchValue(value);

    if (value.length < 3) return;

    setLoading(true);
    setSearchedMaps([]);
    mapsApi.searchMap(value, filters).then((maps) => {
      setSearchedMaps(maps);
      setLoading(false);
    });
  };

  const handleCreateGame = (ev: React.SyntheticEvent) => {
    console.log("name", mapName);
    console.log("map", selectedMap);
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

    const mapId: number | undefined = selectedMap?.id;
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

  useEffect(() => {
    if (searchValue) {
      searchMap({ target: { value: searchValue } } as BaseSyntheticEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    mapsApi.getMaps().then((res) => setDefaultMaps(res));

    mapsApi.getVersions().then((res) => {
      const patches = res.map((el) => ({
        value: el,
        key: el,
        text: el,
      }));
      setPatchesOption(patches);
      setSelectedPatch(patches[0]);
    });
  }, [mapsApi]);

  const handlePatchChange = (_, { value }: DropdownProps) => {
    setSelectedPatch(patchesOption.find((el) => el.value === value));
  };

  const handleVisibilityChange = (_, { value }: DropdownProps) => {
    setMapVisibility(value as number);
  };

  const handleObserversChange = (_, { value }: DropdownProps) => {
    setMapObservers(value as number);
  };

  const handleMapNameChange = (_, { value }: InputOnChangeData) => {
    setMapName(value);
  };

  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
    setCanCreateGame(false);
  };

  return (
    <Container className="create-game">
      <Header>Создание игры</Header>
      <Form action="z">
        <Grid columns="equal" divided>
          <Grid.Row>
            <Grid.Column width={3}>
              <Header size="small">Фильтры</Header>
              <Filters onFitlerChange={setFilters} />
            </Grid.Column>
            <Grid.Column width={9}>
              <Header size="small">Основные параметры</Header>
              {selectedMap && (
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
                    options={patchesOption}
                    value={selectedPatch?.value}
                  />
                </Form.Group>
              )}

              {selectedMap ? (
                <Item.Group className="map-group">
                  <GameCard
                    {...selectedMap}
                    selected={true}
                    onClick={() => setSelectedMap(undefined)}
                  />
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
                </Item.Group>
              ) : (
                <>
                  <Form.Input
                    search
                    fluid
                    selection
                    onChange={searchMap}
                    loading={isLoading}
                    value={searchValue}
                    label="Поиск карты"
                    placeholder="Введите часть названия карты..."
                  />
                  <Item.Group className="map-group">
                    {(searchValue ? searchedMaps : defalutMaps).map(
                      (map, key) => (
                        <GameCard
                          key={key}
                          {...map}
                          selected={false}
                          onClick={() => handleMapSelect(map)}
                        />
                      )
                    )}
                  </Item.Group>
                </>
              )}
            </Grid.Column>
            <Grid.Column width={3}>
              <Header size="small">Дополнительные параметры</Header>
              <Form.Checkbox
                label="Вход по паролю (будет выдан после создания игры)"
                name="enter-with-password"
              />
              <Divider />
              <Form.Checkbox
                label="Города союзников рядом"
                name="mapFlagTeamsTogether"
                onChange={() =>
                  setMapFlagTeamsTogether(mapFlagTeamsTogether ? 0 : 1)
                }
              />
              <Form.Checkbox
                label="Фиксация кланов"
                name="mapFlagFixedTeams"
                onChange={() => setMapFlagFixedTeams(mapFlagFixedTeams ? 0 : 1)}
              />
              <Form.Checkbox
                label="Общие войска"
                name="mapFlagUnitShare"
                onChange={() => setMapFlagUnitShare(mapFlagUnitShare ? 0 : 1)}
              />
              <Form.Checkbox
                label="Случайные расы"
                name="mapFlagRandomRaces"
                onChange={() =>
                  setMapFlagRandomRaces(mapFlagRandomRaces ? 0 : 1)
                }
              />
              <Form.Checkbox
                label="Случайные герои"
                name="mapFlagRandomHero"
                onChange={() => setMapFlagRandomHero(mapFlagRandomHero ? 0 : 1)}
              />
              <Form.Select
                fluid
                name="spectators"
                label="Зрители"
                onChange={handleObserversChange}
                options={observersOptions}
                value={mapObservers}
              />
              <Form.Select
                fluid
                name="visibility"
                label="Карта"
                options={visibilityOptions}
                onChange={handleVisibilityChange}
                value={mapVisibility}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </Container>
  );
}

export default CreateGame;
