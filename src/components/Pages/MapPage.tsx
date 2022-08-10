import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Loader,
  Message,
  Image,
  Header,
  Label,
  Table,
  Button,
} from "semantic-ui-react";
import { RestContext } from "../../context";
import { Category } from "../../models/rest/Category";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import { Map } from "../../models/rest/Map";
import { convertErrorResponseToString } from "../../utils/ApiUtils";

const convertSlotTypeToString = (type: number) => {
  switch (type) {
    case 0:
      return "Открыто";
    case 1:
      return "Закрыто";
    case 2:
      return "Компьютер (слабый)";
    case 3:
      return "Компьютер (срадний)";
    case 4:
      return "Компьютер (сильный)";
  }

  return type;
};

const convertSlotRaceToString = (type: number) => {
  if (type & 1) return "Альянс";
  if (type & 2) return "Орда";
  if (type & 4) return "Ночные эльфы";
  if (type & 8) return "Нежить";
  if (type & 32) return "Случайная раса";


  return type.toString();
};

function MapPage() {
  const { id } = useParams();
  const mapsApi = useContext(RestContext).mapsApi;
  const [mapData, setMapData] = useState<Map | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<ConfigInfo | undefined | null>();

  useEffect(() => {
    mapsApi.getCategories().then((categories) => {
      setCategories(categories);
    });
  }, [mapsApi]);

  useEffect(() => {
    const abort = new AbortController();

    setLoading(true);

    mapsApi
      .getMapInfo(parseInt(id || "0"), { signal: abort.signal })
      .then((map) => {
        setMapData(map);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        if (e.message === "canceled") return;
        setErrorMessage(convertErrorResponseToString(e));
      });

    return () => {
      setLoading(false);
      setConfig(undefined);
      setErrorMessage("");
      setMapData(null);
      abort.abort();
    };
  }, [id, mapsApi]);

  useEffect(() => {
    const abort = new AbortController();

    if (mapData) {
      const readyConfigs =
        mapData.configs?.filter((config) => {
          return config.status === 1;
        }) || [];

      if (readyConfigs.length > 0) {
        mapsApi
          .getDefaultMapConfig(
            parseInt(id || "0"),
            readyConfigs[0].version || "",
            { signal: abort.signal }
          )
          .then((config) => {
            setConfig(config);
          });
      } else setConfig(null);
    }

    return () => {
      abort.abort();
    };
  }, [id, mapData]);

  return (
    <Container>
      {errorMessage && (
        <Message error>
          <p>{errorMessage}</p>
        </Message>
      )}
      {isLoading && (
        <Loader active size="big">
          Загрузка
        </Loader>
      )}
      {mapData && (
        <Grid>
          <Grid.Row>
            <Grid.Column width={3}>
              {mapData.mapInfo?.coverImageUrl && (
                <Image src={mapData.mapInfo?.coverImageUrl} />
              )}
            </Grid.Column>
            <Grid.Column width={10}>
              <Header>
                {mapData.mapInfo?.name}
                <u>#{mapData.id}</u>
              </Header>
              <p>{mapData.mapInfo?.description}</p>
              <p>
                <b>Автор:</b> {mapData.mapInfo?.author}
              </p>
              <p>
                <b>Рекомендации к игрокам:</b>{" "}
                {mapData.mapInfo?.playerRecommendation}
              </p>
            </Grid.Column>
            <Grid.Column width={3}>
              {mapData.mapInfo?.mapImageUrl && (
                <Image src={mapData.mapInfo?.mapImageUrl} />
              )}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <b>Категории: </b>{" "}
            {categories
              .filter((category) => {
                return mapData.categories?.indexOf(category.id || 0) !== -1;
              })
              .map((category) => {
                return <Label key={category.id}>{category.name}</Label>;
              })}
          </Grid.Row>
          <Grid.Row>
            {mapData.downloadUrl && (
              <a href={mapData.downloadUrl} download={mapData.fileName}>
                Скачать (
                {Math.round(((mapData.fileSize || 0) / 1024 / 1024) * 100) /
                  100}{" "}
                МБ)
              </a>
            )}
          </Grid.Row>
          <Grid.Row>
            <Button
              color="red"
              basic
              as="a"
              href={`https://xgm.guru/p/irina/add/219?initial-text=%5B%2B%2B%D0%96%D0%B0%D0%BB%D0%BE%D0%B1%D0%B0%20%D0%BD%D0%B0%20%D0%BA%D0%B0%D1%80%D1%82%D1%83%2B%2B%5D%0A%0A%2A%2A%D0%9D%D0%BE%D1%80%D0%BC%D0%B5%20%D0%BA%D0%B0%D1%80%D1%82%D1%8B%3A%2A%2A%20%23${id}%20%0A%2A%2A%D0%9F%D1%80%D0%B8%D1%87%D0%B8%D0%BD%D0%B0%3A%2A%2A%20%28%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D1%8C%D1%82%D0%B5%20%D0%BE%D0%B4%D0%BD%D1%83%29%20%D1%83%D0%B4%D0%B0%D0%BB%D0%B8%D1%82%D1%8C%20%D0%BA%D0%B0%D1%80%D1%82%D1%83%2C%20%D0%BE%D0%B1%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D1%8C%20%D0%BA%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D0%B8%2C%20%D0%B7%D0%B0%D1%8F%D0%B2%D0%BA%D0%B0%20%D0%BD%D0%B0%20%D0%B2%D0%B5%D1%80%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%86%D0%B8%D1%8E%0A%2A%2A%D0%9A%D0%BE%D0%BC%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%B8%D0%B9%3A%2A%2A%20%0A`}
            >
              Сообщить администрации
            </Button>
          </Grid.Row>
          <Grid.Row>
            {config === undefined && (
              <Loader size="big" active>
                Конфиг загружается
              </Loader>
            )}
            {config === null && (
              <Message style={{ width: "100%" }} info>
                Слоты не парсились
              </Message>
            )}
            {config?.config && (
              <Table>
                <Table.Header>
                  <Table.HeaderCell>Тип</Table.HeaderCell>
                  <Table.HeaderCell>Клан</Table.HeaderCell>
                  <Table.HeaderCell>Раса</Table.HeaderCell>
                  <Table.HeaderCell>Цвет</Table.HeaderCell>
                  <Table.HeaderCell>Фора</Table.HeaderCell>
                </Table.Header>
                {config?.config?.playableSlots.map((slot, index) => {
                  return (
                    <Table.Row key={index}>
                      <Table.Cell>{convertSlotTypeToString(slot.status)}</Table.Cell>
                      <Table.Cell>Клан {slot.team + 1}</Table.Cell>
                      <Table.Cell>{convertSlotRaceToString(slot.race)}</Table.Cell>
                      <Table.Cell>{slot.colour}</Table.Cell>
                      <Table.Cell>{slot.handicap}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table>
            )}
          </Grid.Row>
        </Grid>
      )}
    </Container>
  );
}

export default MapPage;
