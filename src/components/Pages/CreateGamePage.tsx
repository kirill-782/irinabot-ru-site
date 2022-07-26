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
  DropdownItemProps,
} from "semantic-ui-react";
import { RestContext } from "../../context";
import { SearchFilters } from "../../models/rest/SearchFilters";
import "../CreateGame/CreateGame.scss";
import { GameCard } from "../CreateGame/GameCard";
import { Filters } from "../CreateGame/Filters";
import { Map } from "../../models/rest/Map";
import { SelectedGameCard } from "../CreateGame/SelectedGameCard";
import { GameOptionsData } from "../CreateGame/interfaces";
import {
  GameOptions,
  MAP_FLAG_FIXED_TEAMS,
  MAP_FLAG_TEAMS_TOGETHER,
} from "../CreateGame/GameOptions";

function CreateGamePage() {
  const [searchedMaps, setSearchedMaps] = useState<Map[]>([]);
  const [defalutMaps, setDefaultMaps] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map>();
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const { mapsApi } = useContext(RestContext);
  const [patchesOption, setPatchesOption] = useState<DropdownItemProps[]>([]);

  const [options, setOptions] = useState<GameOptionsData>({
    mask: MAP_FLAG_TEAMS_TOGETHER | MAP_FLAG_FIXED_TEAMS,
    privateGame: false,
    slotPreset: "",
    mapObservers: 1,
    mapSpeed: 3,
    mapVisibility: 4,
  });

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
      mapsApi.searchMap(value, filters || {}).then((maps) => {
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

  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
  };

  return (
    <Container className="create-game">
      <Header>Создание игры</Header>
      <Form>
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
                    onClick={() => setSelectedMap(undefined)}
                    patches={patchesOption}
                    options={options}
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
              <GameOptions
                options={options}
                onOptionsChange={setOptions}
              ></GameOptions>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </Container>
  );
}

export default CreateGamePage;
