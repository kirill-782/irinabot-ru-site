import { BaseSyntheticEvent, useState, useContext, useEffect } from "react";
import { Form, Grid, Header, Container, Item } from "semantic-ui-react";
import { RestContext } from "../../context";
import { SearchFilters } from "../../models/rest/SearchFilters";
import "./CreateGame.scss";
import { GameCard } from "./GameCard";
import { Filters } from "./Filters";
import { Map } from "../../models/rest/Map";

const MAP_FLAG_TEAMS_TOGETHER = 1;
const MAP_FLAG_FIXED_TEAMS = 2;
const MAP_FLAG_UNIT_SHARE = 4;
const MAP_FLAG_RANDOM_HERO = 8;
const MAP_FLAG_RANDOM_RACES = 16;

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

const patchesOption = [
  { key: "1.26", text: "1.26", value: "1.26" },
  { key: "1.29", text: "1.29 (коннектор)", value: "1.29" },
  { key: "1.31", text: "1.31 (коннектор)", value: "1.31" },
];

const countPlayers = [
  { key: "0", text: "Любое", value: "0" },
  { key: "1", text: "1", value: "1" },
  { key: "2", text: "2", value: "2" },
  { key: "3", text: "3", value: "3" },
  { key: "4", text: "4", value: "4" },
  { key: "5", text: "5", value: "5" },
  { key: "6", text: "6", value: "6" },
  { key: "7", text: "7", value: "7" },
  { key: "8", text: "8", value: "8" },
  { key: "9", text: "9", value: "9" },
  { key: "10", text: "10", value: "10" },
  { key: "11", text: "11", value: "11" },
  { key: "12", text: "12", value: "12" },
];

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

const genreOptions = [
  { key: "0", text: "(выберите тип карты)", value: "0" },
  { key: "1", text: "Прочее", value: "1" },
  { key: "2", text: "Anime", value: "2" },
  { key: "3", text: "Hero Arena", value: "3" },
  { key: "4", text: "Campaign", value: "4" },
  { key: "5", text: "Castle Defence", value: "5" },
  { key: "6", text: "Hero Defense", value: "6" },
  { key: "7", text: "Melee", value: "7" },
  { key: "8", text: "Mini-games", value: "8" },
  { key: "9", text: "MOBA", value: "9" },
  { key: "10", text: "RPG", value: "10" },
  { key: "11", text: "ORPG", value: "11" },
  { key: "12", text: "Survival", value: "12" },
  { key: "13", text: "Tower Defense", value: "13" },
  { key: "15", text: "Tower Wars", value: "15" },
  { key: "16", text: "TAG", value: "16" },
  { key: "17", text: "Risk", value: "17" },
  { key: "18", text: "Временная категория", value: "18" },
];

function CreateGame() {
  const [searchedMaps, setSearchedMaps] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map>();
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchValue, setSearchValue] = useState("");
  const { mapsApi } = useContext(RestContext);

  console.log("m", searchedMaps);

  const searchMap = ({ target }: BaseSyntheticEvent) => {
    const value = target.value;
    setSearchValue(value);

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
                  options={patchesOption}
                  defaultValue={patchesOption[0].value}
                />
              </Form.Group>
              <Form.Group widths="equal">
                <Form.Select
                  fluid
                  name="map_players"
                  label="Кол-во игроков"
                  options={countPlayers}
                  defaultValue={countPlayers[0].value}
                />

                <Form.Select
                  name="map_genre"
                  fluid
                  label="Тип карты"
                  options={genreOptions}
                  defaultValue={genreOptions[0].value}
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
                    {searchedMaps.map((map, key) => (
                      <GameCard
                        key={key}
                        {...map}
                        selected={false}
                        onClick={() => setSelectedMap(map)}
                      />
                    ))}
                  </Item.Group>
                </>
              )}
            </Grid.Column>
            <Grid.Column width={3}>
              <Header size="small">Дополнительные параметры</Header>
              <Form.Group widths="equal">
                <Form.Input
                  fluid
                  label="Дополнительный админ"
                  placeholder="Ник игрока"
                />
              </Form.Group>
              <Form.Checkbox
                label="Вход по паролю (будет выдан после создания игры)"
                name="enter-with-password"
              />
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
