import React, { ReactNode, useContext } from "react";
import { Icon, Menu, SemanticICONS } from "semantic-ui-react";
import LoginDropdown from "../../Header/LoginDropdown";
import UploadMap from "../../Header/UploadMap";
import UserDrowdown from "../../Header/UserDropdown";
import { AuthContext } from "./../../../context/index";
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
      <Menu.Item name="logo">
        IrInA Host B<Icon name="circle" />T
      </Menu.Item>
      <Menu.Item onClick={handleMenuItemClick}>
        <Icon name="gamepad" />
        Активные Игры
      </Menu.Item>
      <Menu.Item onClick={handleMenuItemClick}>
        <Icon name="help" />
        Справка
      </Menu.Item>

      <Menu.Menu position="right">
        <UploadMap />
        <Menu.Item onClick={handleMenuItemClick}>
          <Icon name="ruble sign" />
          Платные услуги
        </Menu.Item>
        {currentAuth !== null ? <UserDrowdown /> : <LoginDropdown />}
      </Menu.Menu>
    </Menu>
  );
};

export default DesktopMenu;
