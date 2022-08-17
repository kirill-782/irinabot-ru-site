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
import { Filter, MapFilters } from "../MapListPage/MapFilters";
import { Map } from "../../models/rest/Map";
import { SelectedGameCard } from "../CreateGame/SelectedGameCard";
import { GameOptionsData } from "../CreateGame/interfaces";
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
import { useVisibility } from "../../hooks/useVisibility";
import { useSearchMaps } from "../../hooks/useSearchMaps";
import { SITE_TITLE } from "../../config/ApplicationConfig";
import MetaDescription from "../Meta/MetaDescription";
import MetaRobots from "../Meta/MetaRobots";

const defaultFilters: Filter = {
  verify: false,
  taggedOnly: false,
  minPlayers: 1,
  maxPlayers: 24,
  sortBy: "default",
  orderBy: "default",
  category: 0,
  owner: "",
};

function CreateGamePage() {
  const [defalutMaps, setDefaultMaps] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map>();
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const { mapsApi } = useContext(RestContext);
  const [patchesOption, setPatchesOption] = useState<DropdownItemProps[]>([]);
  const [loadButton, setLoadButton] = useState<HTMLButtonElement | null>(null);

  const [searchedMaps, isFull, isLoading, errorMessage, loadNextPage] =
    useSearchMaps(filters, searchValue);

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

  useEffect(() => {
    window.document.title = `Создать игру - ${SITE_TITLE}`;
  }, []);

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

  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
  };

  const isVisible = useVisibility(loadButton, { rootMargin: "100px" });

  useEffect(() => {
    if (isVisible) loadNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

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
      <MetaDescription description="На этой странице можно создать игру" />
      <MetaRobots noIndex />
      <Header>Создание игры</Header>
      <Form>
        <Grid columns="equal" stackable>
          <Grid.Row>
            <Grid.Column width={3}>
              <Header size="small">Фильтры</Header>
              <MapFilters
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
                    <Message className="red">
                      <p>Ошибка: {errorMessage}</p>
                    </Message>
                  )}
                  <Form.Input
                    fluid
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
                    {searchedMaps && !isFull && (
                      <Grid textAlign="center">
                        <button
                          onClick={() => loadNextPage()}
                          disabled={isLoading}
                          className="ui floated button"
                          ref={(el: HTMLButtonElement) => {
                            setLoadButton(el);
                          }}
                        >
                          {isLoading ? "Загрузка. . ." : "Загрузить еще"}
                        </button>
                      </Grid>
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
