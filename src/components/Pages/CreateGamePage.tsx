import React, { useContext, useEffect, useMemo } from "react";
import { Container, Header, Tab } from "semantic-ui-react";
import MapSelectTab from "../CreateGame/MapSelectTab";
import "../CreateGame/CreateGame.scss";
import MetaDescription from "../Meta/MetaDescription";
import MetaRobots from "../Meta/MetaRobots";
import ConfigSelectTab from "../CreateGame/ConfigSelectTab";
import { SITE_TITLE } from "../../config/ApplicationConfig";
import { AppRuntimeSettingsContext } from "../../context";

const panes = [
  {
    menuItem: "page.game.create.tab.map",
    render: () => <MapSelectTab />,
  },
  {
    menuItem: "page.game.create.tab.config",
    render: () => <ConfigSelectTab />,
  },
];

function CreateGamePage() {
  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  useEffect(() => {
    window.document.title = `${lang.page_game_create_new} | ${SITE_TITLE}`;
  }, []);

  return (
    <Container className="create-game">
      <MetaDescription description={lang.gameCreationEx} />
      <MetaRobots noIndex />
      <Header as="h2">{lang.gameCreation}</Header>
      <Tab
        renderActiveOnly
        panes={panes.map((i) => {
          return { ...i, menuItem: t(i.menuItem) };
        })}
      ></Tab>
    </Container>
  );
}

export default CreateGamePage;
