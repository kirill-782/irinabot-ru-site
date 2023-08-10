import React, { useContext} from "react";
import { Container, Header, Tab } from "semantic-ui-react";
import MapSelectTab from "../CreateGame/MapSelectTab";
import "../CreateGame/CreateGame.scss";
import MetaDescription from "../Meta/MetaDescription";
import MetaRobots from "../Meta/MetaRobots";
import ConfigSelectTab from "../CreateGame/ConfigSelectTab";
import { AppRuntimeSettingsContext } from "../../context";
import { useTitle } from "../../hooks/useTitle";
import { LanguageRepositoryKeys } from "../../localization/Lang.ru";

interface PanesItems {
    langKey: LanguageRepositoryKeys;
    [key: string]: any;
}

const panes = [
    {
        langKey: "createGamePageMap",
        render: () => <MapSelectTab />,
    },
    {
        langKey: "createGamePageConfig",
        render: () => <ConfigSelectTab />,
    },
] as PanesItems[];

function CreateGamePage() {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    useTitle(lang.createGameConfirmPageTitle);

    return (
        <Container className="create-game">
            <MetaDescription description={lang.createGameConfirmPageTitle} />
            <MetaRobots noIndex />
            <Header as="h2">{lang.createGamePageCreateGame}</Header>
            <Tab
                renderActiveOnly
                panes={panes.map((i) => {
                    return { ...i, menuItem: lang[i.langKey] };
                })}
            ></Tab>
        </Container>
    );
}

export default CreateGamePage;
