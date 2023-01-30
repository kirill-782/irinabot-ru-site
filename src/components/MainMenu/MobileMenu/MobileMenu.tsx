import React, { ReactNode, useContext } from "react";
import {
  Icon,
  Menu,
  SemanticICONS,
  Checkbox,
  CheckboxProps,
  Dropdown,
} from "semantic-ui-react";
import LoginDropdown from "../../Header/LoginDropdown";
import UserDrowdown from "../../Header/UserDropdown";
import { AppRuntimeSettingsContext, AuthContext } from "./../../../context/index";
import { switchTheme, E_THEME, currentTheme } from "../../../utils/Theme";
import "./MobileMenu.scss";
import UploadMap from "../../Header/UploadMap";
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
  const t = language.getString;
  
  return (
    <Menu fixed="top" inverted className="main-menu mobile-menu">
      <Menu.Menu position="left">
        <Dropdown item icon="bars">
          <Dropdown.Menu>
            <Dropdown.Item as={NavLink} to="/gamelist">
              <Icon name="gamepad" />
              {t("menu.gamelist")}
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/maps">
              <Icon name="file" />
              {t("menu.maplist")}
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/autopay">
              <Icon name="ruble sign" />
              {t("menu.donate")}
            </Dropdown.Item>
            <Dropdown.Item
              as="a"
              href="https://xgm.guru/p/irina"
              onClick={(e) => {
                if (window.open("https://xgm.guru/p/irina")) e.preventDefault();
              }}
            >
              <Icon name="help" />
              {t("menu.help")}
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                switchTheme(
                  currentTheme === E_THEME.LIGHT ? E_THEME.DARK : E_THEME.LIGHT
                );
              }}
            >
              <Icon name={currentTheme === E_THEME.DARK ? "sun" : "moon"} />{" "}
              {t("menu.changeTheme")}
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
