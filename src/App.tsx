import React, { useEffect, useReducer, useState } from "react";
import { SemanticToastContainer } from "react-semantic-toasts";
import { Icon } from "semantic-ui-react";
import Footer from "./components/Footer";
import Header, { MenuItem } from "./components/Header";
import { AppRuntimeSettingsContext, WebsocketContext } from "./context";
import { GHostWebSocket } from "./services/GHostWebsocket";

import "react-semantic-toasts/styles/react-semantic-alert.css";
import PageContent from "./components/PageContent";

const setTheme = (theme: string) => {
  localStorage.setItem("theme", theme);
  document.location.reload();
};

function App() {
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      const head = document.head;
      const link = document.createElement("link");

      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = process.env.PUBLIC_URL + "/styles/semantic.slate.min.css";
      head.appendChild(link);

      return () => {
        head.removeChild(link);
      };
    }
  }, []);

  const menuItems: Array<MenuItem> = [
    {
      type: "item",
      name: "logo",
      text: "Справка",
      node: (
        <span>
          IrInAB
          <Icon name="circle" />T
        </span>
      ),
      onClick: (a, b) => console.log(a, b),
    },
    {
      type: "item",
      name: "gamelist",
      icon: "gamepad",
      text: "Активные игры",
      node: <span>Активные игры</span>,
      onClick: (a, b) => console.log(a, b),
    },
    {
      type: "item",
      name: "help",
      icon: "help",
      text: "Справка",
      node: <span>Справка</span>,
      onClick: (a, b) => console.log(a, b),
    },
    {
      type: "item",
      name: "mapupload",
      icon: "upload",
      text: "Загрузка карт",
      node: <span>Загрузка карт</span>,
      position: "right",
      onClick: (a, b) => console.log(a, b),
    },
    {
      type: "menu",
      name: "usermenu",
      text: "Symmetra",
      node: (
        <span>
          <Icon name="user" />
          Symmetra
        </span>
      ),
      onClick: (a, b) => console.log(a, b),
      subMenu: [
        {
          type: "item",
          name: "donates",
          icon: "ruble sign",
          text: "Загрузка карт",
          node: <span>Донателло</span>,
        },
      ],
    },
    {
      type: "menu",
      name: "theme",
      text: "Выбор темы",
      node: (
        <span>
          <Icon name="paint brush" />
          Выбор темы
        </span>
      ),
      onClick: (...args) => console.log("theme", ...args),
      subMenu: [
        {
          type: "item",
          name: "dark",
          icon: "sun",
          text: "Тёмная тема",
          node: <span>Тёмная тема</span>,
          onClick: () => setTheme("dark"),
        },
        {
          type: "item",
          name: "light",
          icon: "sun outline",
          text: "Светлая тема",
          node: <span>Светлая тема</span>,
          onClick: () => setTheme("light"),
        },
      ],
    },
  ];

  const [ghostSocket, dispatchGHostSocket] = useReducer((state, action) => {
    if (action === "connect") state.connect();
    if (action === "destroy") state.destroy();
    return state;
  }, new GHostWebSocket({ url: "wss://irinabot.ru/ghost/" }));

  useEffect(() => {
    dispatchGHostSocket("connect");

    return () => {
      dispatchGHostSocket("destroy");
    };
  }, []);

  const [gameListLocked, setGameListLocked] = useState(false);
  return (
    <WebsocketContext.Provider
      value={{
        ghostSocket,
      }}
    >
      <AppRuntimeSettingsContext.Provider
        value={{
          gameList: { locked: gameListLocked, setLocked: setGameListLocked },
        }}
      >
        <Header items={menuItems}></Header>
        <SemanticToastContainer animation="fade" position="top-right" />
        <PageContent />
        <Footer></Footer>
      </AppRuntimeSettingsContext.Provider>
    </WebsocketContext.Provider>
  );
}

export default App;
