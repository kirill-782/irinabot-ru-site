import React, { useMemo } from "react";
import { Container, Header, Tab } from "semantic-ui-react";
import MapSelectTab from "../CreateGame/MapSelectTab";
import "../CreateGame/CreateGame.scss";
import MetaDescription from "../Meta/MetaDescription";
import MetaRobots from "../Meta/MetaRobots";

const panes = [
  {
    menuItem: "Карта",
    render: () => <MapSelectTab />,
  },
  {
    menuItem: "Конфиг",
    render: () => null,
  },
];

function CreateGamePage() {
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
