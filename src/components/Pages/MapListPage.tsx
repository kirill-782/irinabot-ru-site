import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Form, Grid, Header, Image, Item } from "semantic-ui-react";
import { useSearchMaps } from "../../hooks/useSearchMaps";
import { SearchFilters } from "../../models/rest/SearchFilters";
import { GameCard } from "../CreateGame/GameCard";
import { Filter, MapFilters } from "../MapListPage/MapFilters";

const defaultFilters: Filter = {
  verify: false,
  taggedOnly: false,
  minPlayers: 1,
  maxPlayers: 24,
  sortBy: "creationDate",
  orderBy: "desc",
  category: 0,
};

function MapListPage() {
  const [filters, setFilters] = useState<SearchFilters | null>(null);

  const [searchedMaps, isFull, isLoading, errorMessage, loadNextPage] =
    useSearchMaps(filters, "TD");

  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    console.log(loc);
  }, [loc])

  return (
    <Container className="create-game">
      <Header>Список карт</Header>
      <Form>
        <Grid columns="equal" stackable centered>
          <Grid.Row>
            <Grid.Column width={3}>
              <Header size="small">Фильтры</Header>
              <MapFilters
                onFitlerChange={setFilters}
                defaultFilters={defaultFilters}
              />
            </Grid.Column>
            <Grid.Column width={12}>
              {searchedMaps &&
                searchedMaps.map((map, key) => (
                  <GameCard
                    key={key}
                    {...map}
                    selected={false}
                    onClick={() => {
                      navigate("?asuna=" + map.id);
                    }}
                  />
                ))}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </Container>
  );
}

export default MapListPage;
