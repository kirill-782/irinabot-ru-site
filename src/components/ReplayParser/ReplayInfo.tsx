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
  const {language} = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  
  return (
    <Container>
      <Header>{name}</Header>
      <Tab
        panes={[
          {
            menuItem: t("page.replay.info.base"),
            render: () => <ReplayMainInfo />,
          },
          {
            menuItem: t("page.replay.info.chat"),
            render: () => <ChatTab />,
          },
          {
            menuItem: t("page.replay.info.blocks"),
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
