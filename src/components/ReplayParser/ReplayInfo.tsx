import React, { useContext, useEffect, useState } from "react";
import { Container, Header, Tab } from "semantic-ui-react";
import { ReplayContext } from "./../Pages/ReplayParserPage";
import ReplayMainInfo from "./ReplayMainInfo";
import ChatTab from "./ChatTab";
import ActionLog from "./ActionLog";
import W3MMDStats from "./W3MMDStats";

function ReplayInfo() {
  const { replayData, replayActions, name } = useContext(ReplayContext) || {};

  return (
    <Container>
      <Header>{name}</Header>
      <Tab
        panes={[
          {
            menuItem: "Основная информация",
            render: () => <ReplayMainInfo />,
          },
          {
            menuItem: "Чат",
            render: () => <ChatTab />,
          },
          {
            menuItem: "Блоки",
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
