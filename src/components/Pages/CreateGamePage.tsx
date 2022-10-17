import React, { useEffect, useMemo } from "react";
import { Container, Header, Tab } from "semantic-ui-react";
import MapSelectTab from "../CreateGame/MapSelectTab";
import "../CreateGame/CreateGame.scss";
import MetaDescription from "../Meta/MetaDescription";
import MetaRobots from "../Meta/MetaRobots";
import ConfigSelectTab from "../CreateGame/ConfigSelectTab";
import { SITE_TITLE } from "../../config/ApplicationConfig";

const panes = [
  {
    menuItem: "Карта",
    render: () => <MapSelectTab />,
  },
  {
    menuItem: "Конфиг",
    render: () => <ConfigSelectTab />,
  },
];

function CreateGamePage() {

  useEffect(() => {
    window.document.title = `Создать игру | ${SITE_TITLE}`;
  }, []);


  return (
    <Container className="create-game">
      <MetaDescription description="На этой странице можно создать игру" />
      <MetaRobots noIndex />
      <Header as="h2">Создание игры</Header>
      <Tab renderActiveOnly panes={panes}></Tab>
    </Container>
  );
}

export default CreateGamePage;
