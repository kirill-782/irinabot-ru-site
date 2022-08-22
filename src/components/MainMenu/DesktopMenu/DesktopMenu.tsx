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
import { AuthContext } from "./../../../context/index";
import { switchTheme, E_THEME, currentTheme } from "../../../utils/Theme";
import "./DesktopMenu.scss";
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

const DesktopMenu = () => {
  const authContext = useContext(AuthContext);
  const currentAuth = authContext.auth.currentAuth;

  const handleMenuItemClick = () => {};

  return (
    <Menu fixed="top" inverted className="main-menu">
      <Menu.Item as={NavLink} to="/">
        IrInA Host B<Icon name="circle" style={{ margin: 0 }} />T
      </Menu.Item>
      <Menu.Item as={NavLink} to="/gamelist">
        <Icon name="gamepad" />
        Активные Игры
      </Menu.Item>
      <Menu.Item onClick={handleMenuItemClick}>
        <Icon name="help" />
        Справка
      </Menu.Item>
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
          Донат
        </Menu.Item>

        {currentAuth !== null ? <UserDrowdown /> : <LoginDropdown />}
      </Menu.Menu>
    </Menu>
  );
};

export default DesktopMenu;
