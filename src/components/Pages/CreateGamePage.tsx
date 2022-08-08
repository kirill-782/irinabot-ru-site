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
  Modal,
  Button,
  Input,
  Message,
} from "semantic-ui-react";
import { RestContext, WebsocketContext } from "../../context";
import { SearchFilters } from "../../models/rest/SearchFilters";
import "../CreateGame/CreateGame.scss";
import { GameCard } from "../CreateGame/GameCard";
import { Filters } from "../CreateGame/Filters";
import { Map } from "../../models/rest/Map";
import { SelectedGameCard } from "../CreateGame/SelectedGameCard";
import { Filter, GameOptionsData } from "../CreateGame/interfaces";
import {
  GameOptions,
  MAP_FLAG_FIXED_TEAMS,
  MAP_FLAG_TEAMS_TOGETHER,
} from "../CreateGame/GameOptions";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_CREATE_GAME_RESPONSE,
} from "./../../models/websocket/HeaderConstants";
import { ServerCreateGame } from "./../../models/websocket/ServerCreateGame";
import { toast } from "react-semantic-toasts";
import copy from "clipboard-copy";

const defaultFilters: Filter = {
  verify: false,
  taggedOnly: false,
  minPlayers: 1,
  maxPlayers: 24,
  sortBy: "creationDate",
  orderBy: "desc",
  category: 0,
};

function CreateGamePage() {
  const [searchedMaps, setSearchedMaps] = useState<Map[] | null>(null);
  const [defalutMaps, setDefaultMaps] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map>();
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const { mapsApi } = useContext(RestContext);
  const [patchesOption, setPatchesOption] = useState<DropdownItemProps[]>([]);

  const [lastPassword, setLastPassword] = useState("");

  const [options, setOptions] = useState<GameOptionsData>({
    mask: MAP_FLAG_TEAMS_TOGETHER | MAP_FLAG_FIXED_TEAMS,
    privateGame: false,
    slotPreset: "",
    mapObservers: 1,
    mapSpeed: 3,
    mapVisibility: 4,
  });

  const sockets = useContext(WebsocketContext);

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
    const searchMap = (value: string, filters: SearchFilters) => {
      if (value.length < 2 && !filters) return;

      setLoading(true);
      setSearchedMaps(null);
      setErrorMessage("");
      mapsApi
        .searchMap(filters, value.length >= 2 ? value : undefined)
        .then((maps) => {
          setSearchedMaps(maps);
          setLoading(false);
        })
        .catch((e) => {
          setSearchedMaps([]);
          setLoading(false);

          if (e.response)
            setErrorMessage("Unexcepted status " + e.response.status);
        });
    };

    if (searchValue || filters) {
      const timer = setTimeout(() => {
        searchMap(searchValue, filters || {});
      }, 300);

      return () => clearTimeout(timer);
    } else setSearchedMaps(null);
  }, [searchValue, filters, mapsApi]);

  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
  };

  useEffect(() => {
    const onPacket = (packet: GHostPackageEvent) => {
      const packetData = packet.detail.package;

      if (
        packetData.context === DEFAULT_CONTEXT_HEADER_CONSTANT &&
        packetData.type === DEFAULT_CREATE_GAME_RESPONSE
      ) {
        const createGameResponse = packetData as ServerCreateGame;

        if (createGameResponse.status === 0) {
          if (!createGameResponse.password) {
            toast({
              title: "Игра создана",
              description: "TODO: Скоприровать описание",
              icon: "check",
              color: "green",
            });
          } else {
            setLastPassword(createGameResponse.password);
          }
        } else {
          toast({
            title: "Ошибка при создании игры",
            description: createGameResponse.description,
            icon: "x",
            color: "red",
          });
        }
      }
    };

    sockets.ghostSocket.addEventListener("package", onPacket);

    return () => {
      sockets.ghostSocket.removeEventListener("package", onPacket);
    };
  }, [sockets.ghostSocket]);

  const renderMapList = searchedMaps || defalutMaps;

  return (
    <Container className="create-game">
      <Header>Создание игры</Header>
      <Form>
        <Grid columns="equal" divided>
          <Grid.Row>
            <Grid.Column width={3}>
              <Header size="small">Фильтры</Header>
              <Filters
                onFitlerChange={setFilters}
                defaultFilters={defaultFilters}
              />
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
                  {errorMessage.length > 0 && (
                    <Message error>
                      <p>Ошибка: {errorMessage}</p>
                    </Message>
                  )}
                  <Form.Input
                    search
                    fluid
                    selection
                    onChange={handleSearchChange}
                    loading={isLoading}
                    value={searchValue}
                    error={!!errorMessage}
                    label="Поиск карты"
                    placeholder="Введите часть названия карты..."
                  />
                  {!isLoading && renderMapList.length == 0 && (
                    <Message>
                      <p>Карты не найдены</p>
                    </Message>
                  )}
                  <Item.Group className="map-group">
                    {renderMapList.map((map, key) => (
                      <GameCard
                        key={key}
                        {...map}
                        selected={false}
                        onClick={() => handleMapSelect(map)}
                      />
                    ))}
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
      <Modal
        open={!!lastPassword}
        onClose={() => {
          setLastPassword("");
        }}
      >
        <Modal.Header>Пароль для входа в игру</Modal.Header>
        <Modal.Content>
          <p>Скопируйте этот пароль, чтобы попасть в игру.</p>
          <Input
            action={{
              icon: "copy",
              content: "Копировать",
              onClick: () => {
                copy(lastPassword);
              },
            }}
            disabled
            fluid
            value={lastPassword}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            positive
            onClick={() => {
              setLastPassword("");
            }}
          >
            Закрыть
          </Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
}

export default CreateGamePage;
