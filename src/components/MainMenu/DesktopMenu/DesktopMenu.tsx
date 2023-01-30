import React, { ReactNode, useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  Icon,
  Menu,
  SemanticICONS,
  Checkbox,
  CheckboxProps,
} from "semantic-ui-react";
import LoginDropdown from "../../Header/LoginDropdown";
import UploadMap from "../../Header/UploadMap";
import UserDrowdown from "../../Header/UserDropdown";
import { AppRuntimeSettingsContext, AuthContext } from "./../../../context/index";
import { switchTheme, E_THEME, currentTheme } from "../../../utils/Theme";
import "./DesktopMenu.scss";
import UtilsDropdown from "../../Header/UtilsDropdown";
import LanguageDropdown from "../../Header/LanguageDropdown";

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

const DesktopMenu = () => {
  const authContext = useContext(AuthContext);
  const currentAuth = authContext.auth.currentAuth;

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  
  const handleMenuItemClick = () => {};

  return (
    <Menu fixed="top" inverted className="main-menu">
      <Menu.Item as={NavLink} to="/">
        IrInA Host B<Icon name="circle" style={{ margin: 0 }} />T
      </Menu.Item>
      <Menu.Item
        as={NavLink}
        icon="gamepad"
        to="/gamelist"
        title={t("menu.gamelist")}
      />
      <Menu.Item
        as={NavLink}
        icon="file"
        to="/maps"
        title={t("menu.maplist")}
      />
      <Menu.Item
        as="a"
        title={t("menu.help")}
        icon="help"
        href="https://xgm.guru/p/irina"
        onClick={(e) => {
          if (window.open("https://xgm.guru/p/irina")) e.preventDefault();
        }}
      />
      <Menu.Item
        onClick={() => {
          switchTheme(
            currentTheme === E_THEME.LIGHT ? E_THEME.DARK : E_THEME.LIGHT
          );
        }}
      >
        <Icon
          name={currentTheme === E_THEME.DARK ? "sun" : "moon"}
          style={{ margin: 0 }}
        />
      </Menu.Item>

      <Menu.Menu position="right">
        <UtilsDropdown />
        <Menu.Item as={NavLink} to="/autopay">
          <Icon name="ruble sign" />
          {t("menu.donate")}
        </Menu.Item>

        <LanguageDropdown />
        {currentAuth !== null ? <UserDrowdown /> : <LoginDropdown />}
      </Menu.Menu>
    </Menu>
  );
};

export default DesktopMenu;
