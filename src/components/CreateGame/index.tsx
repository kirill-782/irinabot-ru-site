import { BaseSyntheticEvent, useState, useContext, useEffect } from "react";
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

// const MAP_FLAG_TEAMS_TOGETHER = 1;
// const MAP_FLAG_FIXED_TEAMS = 2;
// const MAP_FLAG_UNIT_SHARE = 4;
// const MAP_FLAG_RANDOM_HERO = 8;
// const MAP_FLAG_RANDOM_RACES = 16;

// const assemblyMapOptions = (
//   mapFlags: number,
//   mapSpeed: number,
//   mapVisibility: number,
//   mapObservers: number
// ): number => {
//   return (
//     mapFlags | ((mapSpeed | (mapVisibility << 2) | (mapObservers << 5)) << 8)
//   );
// };

const visibilityOptions = [
  { key: "4", text: "По умочланию", value: "4" },
  { key: "1", text: "Скрыта", value: "1" },
  { key: "2", text: "Разведана", value: "2" },
  { key: "3", text: "Открыта", value: "3" },
];

const spectatorsOptions = [
  { key: "1", text: "Нет", value: "1" },
  { key: "3", text: "Все зрители", value: "3" },
  { key: "2", text: "После поражения", value: "2" },
  { key: "4", text: "Судьи", value: "4" },
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
              <Form.Group widths="equal">
                <Form.Input
                  fluid
                  name="name"
                  label="Название игры"
                  placeholder="Название игры"
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

              {selectedMap ? (
                <Item.Group className="map-group">
                  <GameCard
                    {...selectedMap}
                    selected={true}
                    onClick={() => setSelectedMap(undefined)}
                  />
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
                          onClick={() => setSelectedMap(map)}
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
              <Form.Checkbox label="Города союзников рядом" name="near_city" />
              <Form.Checkbox label="Фиксация кланов" name="fixed_clans" />
              <Form.Checkbox label="Общие войска" name="common_units" />
              <Form.Checkbox label="Случайные герои" name="random_heroes" />
              <Form.Checkbox label="Случайные расы" name="random_race" />
              <Form.Select
                fluid
                name="spectators"
                label="Зрители"
                options={spectatorsOptions}
                defaultValue={spectatorsOptions[0].value}
              />
              <Form.Select
                fluid
                name="visibility"
                label="Карта"
                options={visibilityOptions}
                defaultValue={visibilityOptions[0].value}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </Container>
  );
}

export default CreateGame;
