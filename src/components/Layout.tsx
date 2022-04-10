import { Outlet } from "react-router-dom";
import { SemanticToastContainer } from "react-semantic-toasts";
import { Icon } from "semantic-ui-react";
import { Checkbox } from "semantic-ui-react";
import type { CheckboxProps } from "semantic-ui-react";
import Footer from "./Footer";
import { switchTheme, E_THEME, getTheme } from "../utils/Theme";
import Header, { MenuItem } from "./Header";

const handleChangeTheme = (_, data: CheckboxProps) => {
  switchTheme(data.checked ? E_THEME.DARK : E_THEME.LIGHT);
};

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
    type: "item",
    name: "theme",
    text: "Выбор темы",
    node: (
      <span>
        <Checkbox
          toggle
          checked={getTheme() === E_THEME.DARK}
          onChange={handleChangeTheme}
          label={
            <>
              Тема <Icon name="sun" />
            </>
          }
        />
      </span>
    ),
    onClick: (...args) => console.log("theme", ...args),
  },
];

function Layout() {
  return (
    <>
      <Header items={menuItems}></Header>
      <SemanticToastContainer animation="fade" position="top-right" />
      <div style={{ marginTop: 70 }}>
        <Outlet />
      </div>
      <Footer></Footer>
    </>
  );
}

export default Layout;
