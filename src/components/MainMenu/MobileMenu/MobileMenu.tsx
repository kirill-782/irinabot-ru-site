import React, { ReactNode, useContext } from "react";
import {
  Icon,
  Menu,
  SemanticICONS,
  Dropdown,
} from "semantic-ui-react";
import LoginDropdown from "../../Header/LoginDropdown";
import UserDrowdown from "../../Header/UserDropdown";
import {
  AppRuntimeSettingsContext,
  AuthContext,
} from "../../../context";
import { switchTheme, E_THEME, currentTheme } from "../../../utils/Theme";
import "./MobileMenu.scss";
import { NavLink } from "react-router-dom";
import UtilsDropdown from "../../Header/UtilsDropdown";

export interface MenuItem {
  type: string;
  position?: "left" | "right";
  icon?: SemanticICONS;
  name: string;
  text?: string;
  node?: ReactNode;
  subMenu?: Array<MenuItem>;
  onClick?;
}

const MobileMenu = () => {
  const authContext = useContext(AuthContext);
  const currentAuth = authContext.auth.currentAuth;

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  return (
    <Menu fixed="top" inverted className="main-menu mobile-menu">
      <Menu.Menu position="left">
        <Dropdown item icon="bars">
          <Dropdown.Menu>
            <Dropdown.Item as={NavLink} to="/gamelist">
              <Icon name="gamepad" />
              {lang.menuActiveGames}
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/maps">
              <Icon name="file" />
              {lang.menuMapList}
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/autopay">
              <Icon name="ruble sign" />
              {lang.menuAutoPay}
            </Dropdown.Item>
            <Dropdown.Item
              as="a"
              href="https://xgm.guru/p/irina"
              onClick={(e) => {
                if (window.open("https://xgm.guru/p/irina")) e.preventDefault();
              }}
            >
              <Icon name="help" />
              {lang.menuHelp}
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                switchTheme(
                  currentTheme === E_THEME.LIGHT ? E_THEME.DARK : E_THEME.LIGHT
                );
              }}
            >
              <Icon name={currentTheme === E_THEME.DARK ? "sun" : "moon"} />{" "}
              {lang.menuThemeChange}
            </Dropdown.Item>
            <UtilsDropdown />
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Menu>
      <Menu.Menu position="right">
        {currentAuth !== null ? <UserDrowdown /> : <LoginDropdown />}
      </Menu.Menu>
    </Menu>
  );
};

export default MobileMenu;
