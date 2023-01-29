import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container, Header } from "semantic-ui-react";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { Map } from "../../models/rest/Map";

function MapCatalog() {
  const { mapsApi } = useContext(RestContext);
  const { page } = useParams();

  const [searchedMaps, setSearchedMaps] = useState<Map[] | null>(null);

  const pageNum = parseInt(page || "1");
  
  const {language} = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  useEffect(() => {
    mapsApi
      .searchMap(
        {
          minPlayers: 1,
        },
        {
          orderBy: "desc",
          sortBy: "creationDate",
        },
        undefined,
        {
          count: 20,
          offset: (pageNum - 1) * 20,
        }
      )
      .then((maps) => {
        setSearchedMaps(maps);
      });
  }, [pageNum]);

  const pageNavigator = new Array<number>();

  for (let i = Math.max(1, pageNum - 5); i < pageNum + 6; ++i) {
    pageNavigator.push(i);
  }

  return (
    <Container>
      <Header>{t("page.map.catalog")}</Header>
      {searchedMaps?.map((i) => {
        return (
          <div>
            <Link to={`/maps/${i.id}`}>{i.mapInfo?.name}</Link>
          </div>
        );
      })}
      <div>
        {searchedMaps?.length > 0 && pageNavigator.map((i) => {
          if (i === pageNum) {
            return <b style={{ marginRight: 5 }}>{i}</b>;
          }
          return <Link style={{ marginRight: 5 }} to={`/maps/catalog/${i}`}>{i}</Link>;
        })}
      </div>
    </Container>
  );
}

export default MapCatalog;
