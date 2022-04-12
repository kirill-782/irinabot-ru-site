import React, { ReactNode, useContext } from "react";
import { Icon, Menu, SemanticICONS } from "semantic-ui-react";
import "./Header.scss";
import { AuthContext } from "./../context/index";
import LoginDropdown from "./Header/LoginDropdown";
import UserDrowdown from "./Header/UserDropdown";

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

function Header() {
  const authContext = useContext(AuthContext);
  const currentAuth = authContext.auth.currentAuth;

  return (
    <Menu fixed="top" inverted>
      <Menu.Item name="logo">
        IrInA Host B<Icon name="circle" />T
      </Menu.Item>
      <Menu.Menu position="right">
        {currentAuth !== null ? <UserDrowdown /> : <LoginDropdown />}
      </Menu.Menu>
    </Menu>
  );
}

export default Header;
