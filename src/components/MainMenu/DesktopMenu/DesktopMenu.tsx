import React, { ReactNode, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Icon, Menu, SemanticICONS, Checkbox, CheckboxProps } from "semantic-ui-react";
import LoginDropdown from "../../Header/LoginDropdown";
import UploadMap from "../../Header/UploadMap";
import UserDrowdown from "../../Header/UserDropdown";
import { AuthContext } from "./../../../context/index";
import { switchTheme, E_THEME, getTheme } from "../../../utils/Theme";
import "./DesktopMenu.scss";

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

  const handleMenuItemClick = () => {
    console.log("menu item clicked");
  };

  return (
    <Menu fixed="top" inverted className="main-menu">
      <Menu.Item as={NavLink} to="/">
        IrInA Host B<Icon name="circle" />T
      </Menu.Item>
      <Menu.Item as={NavLink} to="/gamelist">
        <Icon name="gamepad" />
        Активные Игры
      </Menu.Item>
      <Menu.Item onClick={handleMenuItemClick}>
        <Icon name="help" />
        Справка
      </Menu.Item>

      <Menu.Menu position="right">
        <UploadMap />
        <Menu.Item as={NavLink} to="/autopay">
          <Icon name="ruble sign" />
          Донат
        </Menu.Item>
        <Checkbox
          toggle
          className="item theme-switcher"
          checked={getTheme() === E_THEME.DARK}
          onChange={(_, data: CheckboxProps) => switchTheme(data.checked ? E_THEME.DARK : E_THEME.LIGHT)}
          label={
            <>
              <Icon name="paint brush" />
              Сменить тему
            </>
          }
        />
        {currentAuth !== null ? <UserDrowdown /> : <LoginDropdown />}
      </Menu.Menu>
    </Menu>
  );
};

export default DesktopMenu;
