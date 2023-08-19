import React, { useContext, useEffect, useState } from "react";
import { Container, Header, Tab } from "semantic-ui-react";
import { ReplayContext } from "./../Pages/ReplayParserPage";
import ReplayMainInfo from "./ReplayMainInfo";
import ChatTab from "./ChatTab";
import ActionLog from "./ActionLog";
import W3MMDStats from "./W3MMDStats";
import { AppRuntimeSettingsContext } from "../../context";

function ReplayInfo() {
    const { name } = useContext(ReplayContext) || {};
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    return (
        <Container>
            <Header>{name}</Header>
            <Tab
                panes={[
                    {
                        menuItem: lang.replayInfo_1,
                        render: () => <ReplayMainInfo />,
                    },
                    {
                        menuItem: lang.replayInfo_2,
                        render: () => <ChatTab />,
                    },
                    {
                        menuItem: lang.replayInfo_3,
                        render: () => <ActionLog />,
                    },
                    {
                        menuItem: "W3MMD",
                        render: () => <W3MMDStats />,
                    },
                ]}
            ></Tab>
        </Container>
    );
}

export default ReplayInfo;
