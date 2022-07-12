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
} from "semantic-ui-react";
import { RestContext } from "../../context";
import { SearchFilters } from "../../models/rest/SearchFilters";
import "./CreateGame.scss";
import { GameCard } from "./GameCard";
import { Filters } from "./Filters";
import { Map } from "../../models/rest/Map";
import { SelectedGameCard } from "./SelectedGameCard";

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

  const [mapFlagTeamsTogether, setMapFlagTeamsTogether] = useState(0);
  const [mapFlagFixedTeams, setMapFlagFixedTeams] = useState(0);
  const [mapFlagUnitShare, setMapFlagUnitShare] = useState(0);
  const [mapFlagRandomHero, setMapFlagRandomHero] = useState(0);
  const [mapFlagRandomRaces, setMapFlagRandomRaces] = useState(0);

  const [mapSpeed] = useState(0);
  const [mapVisibility, setMapVisibility] = useState(4);
  const [mapObservers, setMapObservers] = useState(1);

  console.log("m", searchedMaps);

  const handleSearchChange = ({ target: { value } }: BaseSyntheticEvent) =>
    setSearchValue(value);

  useEffect(() => {
    mapsApi.getMaps().then((res) => setDefaultMaps(res));

    mapsApi.getVersions().then((res) => {
      const patches = res.map((el) => ({
        value: el,
        key: el,
        text: el,
      }));
      setPatchesOption(patches);
    });
  }, [mapsApi]);

  useEffect(() => {
    const searchMap = (value: string) => {
      if (value.length < 3) return;

      setLoading(true);
      setSearchedMaps([]);
      mapsApi.searchMap(value, filters).then((maps) => {
        setSearchedMaps(maps);
        setLoading(false);
      });
    };

    const timer = setTimeout(() => {
      if (searchValue) {
        searchMap(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters, mapsApi]);

  const handleVisibilityChange = (_, { value }: DropdownProps) => {
    setMapVisibility(value as number);
  };

  const handleObserversChange = (_, { value }: DropdownProps) => {
    setMapObservers(value as number);
  };

  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
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
              {selectedMap ? (
                <Item.Group className="map-group">
                  <SelectedGameCard
                    map={selectedMap}
                    selected={true}
                    onClick={() => setSelectedMap(undefined)}
                    mapFlagFixedTeams={mapFlagFixedTeams}
                    mapFlagRandomHero={mapFlagRandomHero}
                    mapFlagRandomRaces={mapFlagRandomRaces}
                    mapObservers={mapObservers}
                    mapFlagTeamsTogether={mapFlagTeamsTogether}
                    mapFlagUnitShare={mapFlagUnitShare}
                    mapSpeed={mapSpeed}
                    mapVisibility={mapVisibility}
                    patches={patchesOption}
                  />
                </Item.Group>
              ) : (
                <>
                  <Form.Input
                    search
                    fluid
                    selection
                    onChange={handleSearchChange}
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
