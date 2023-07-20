import React, { useContext, useEffect, useState } from "react";
import { Container, Header, Tab } from "semantic-ui-react";
import { ReplayContext } from "./../Pages/ReplayParserPage";
import ReplayMainInfo from "./ReplayMainInfo";
import ChatTab from "./ChatTab";
import ActionLog from "./ActionLog";
import W3MMDStats from "./W3MMDStats";
import { AppRuntimeSettingsContext } from "../../context";

function ReplayInfo() {
  const { replayData, replayActions, name } = useContext(ReplayContext) || {};
  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  return (
    <Container>
      <Header>{name}</Header>
      <Tab
        panes={[
          {
            menuItem: lang.baseInfo,
            render: () => <ReplayMainInfo />,
          },
          {
            menuItem: lang.page_replay_info_chat,
            render: () => <ChatTab />,
          },
          {
            menuItem: lang.blocks,
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
