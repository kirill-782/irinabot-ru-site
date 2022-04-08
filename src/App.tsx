import React, { useEffect, useReducer, useState } from "react";
import { SemanticToastContainer } from "react-semantic-toasts";
import { Icon } from "semantic-ui-react";
import Footer from "./components/Footer";
import GameList from "./components/GameList";
import Header, { MenuItem } from "./components/Header";
import { AppRuntimeSettingsContext, WebsocketContext } from "./context";
import {GHostWebSocket } from "./services/GHostWebsocket"

import 'react-semantic-toasts/styles/react-semantic-alert.css';
import PageContent from "./components/PageContent";

function App() {

  const menuItems: Array<MenuItem> = [
    {
      type: "item",
      name: "logo",
      text: "Справка",
      node: (<span>IrInAB<Icon name="circle"/>T</span>),
      onClick: (a,b)=>console.log(a,b)
    },
    {
      type: "item",
      name: "gamelist",
      icon: "gamepad",
      text: "Активные игры",
      node: (<span>Активные игры</span>),
      onClick: (a,b)=>console.log(a,b)
    },
    {
      type: "item",
      name: "help",
      icon: "help",
      text: "Справка",
      node: (<span>Справка</span>),
      onClick: (a,b)=>console.log(a,b)
    },
    {
      type: "item",
      name: "mapupload",
      icon: "upload",
      text: "Загрузка карт",
      node: (<span>Загрузка карт</span>),
      position: "right",onClick: (a,b)=>console.log(a,b)
    },
    {
      type: "menu",
      name: "usermenu",
      text: "Symmetra",
      node: (<span><Icon name="user"/>Symmetra</span>),
      onClick: (a,b)=>console.log(a,b),
      subMenu: [
        {
          type: "item",
          name: "donates",
          icon: "ruble sign",
          text: "Загрузка карт",
          node: (<span>Донателло</span>)
        }
      ]
    }
  ];

  const [ghostSocket, dispatchGHostSocket] = useReducer((state, action) => {
    if(action === "connect")
      state.connect( );
    if(action === "destroy")
      state.destroy( );
    return state;
  }, new GHostWebSocket({url : "wss://irinabot.ru/ghost/"}));


  useEffect(()=> {
    dispatchGHostSocket("connect");

    return () => {
      dispatchGHostSocket("destroy");
    }
  }, []);


  const[gameListLocked, setGameListLocked] = useState(false);

  return (
    <WebsocketContext.Provider value={{
      ghostSocket
    }}>
      <AppRuntimeSettingsContext.Provider value={{
        gameList: {locked: gameListLocked, setLocked: setGameListLocked}
      }}>
        <Header items={menuItems}></Header>
        <SemanticToastContainer animation="fade" position="top-right" />
        <PageContent/>
        <Footer></Footer>
      </AppRuntimeSettingsContext.Provider>
    </WebsocketContext.Provider>
  )
}

export default App;
