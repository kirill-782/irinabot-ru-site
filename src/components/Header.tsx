import React, { ReactNode, useContext } from "react";
import { Dropdown, Icon, Menu, SemanticICONS } from "semantic-ui-react";
import { useWindowSize } from "../hooks/useWindowSize";
import "./Header.scss";
import { AuthContext } from "./../context/index";

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
  const windowSize = useWindowSize();

  const authContext = useContext(AuthContext);
  const currentAuth = authContext.auth.currentAuth;

  if (windowSize.width === undefined || windowSize.width > 767) {
    // PC BAR
    return (
      <Menu inverted fixed="top" className="desktop-menu">
        <Menu.Item name="logo">
          IrInA Host B<Icon name="circle" />T
        </Menu.Item>
        <Menu.Item name="logo" position="right">
          {currentAuth !== null ? currentAuth.connectorName : "Анонимус"}
        </Menu.Item>
      </Menu>
    );
  } else {
    // Mobile bar

    return <Menu className="mobile-menu"></Menu>;
  }
}

export default Header;
