import React, { ReactNode } from "react";
import { Dropdown, Icon, Menu, SemanticICONS } from "semantic-ui-react";
import { useWindowSize } from "../hooks/useWindowSize";

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

interface HeaderProps {
  items?: Array<MenuItem>;
}

function Header({ items }: HeaderProps) {
  const windowSize = useWindowSize();

  if (windowSize.width === undefined || windowSize.width > 767) {
    // PC BAR
    return (
      <Menu inverted fixed="top">
        {items.map((item) => {
          if (item.type === "item") return processAsMenuItem(item);
          else return processAsMenuDropDown(item);
        })}
      </Menu>
    );
  } else {
    // Mobile bar

    return (
      <Menu>
        <Menu.Item content="Mobile Menu"></Menu.Item>
      </Menu>
    );
  }
}

function processAsMenuItem(item: MenuItem): ReactNode {
  return (
    <Menu.Item
      onClick={item.onClick}
      name={item.name}
      icon={item.icon === undefined}
      position={item.position}
      key={item.name}
    >
      <Icon name={item.icon} />
      {item.node}
    </Menu.Item>
  );
}

function processAsMenuDropDown(item: MenuItem): ReactNode {
  return (
    <Menu.Menu position={item.position} key={item.name}>
      <Dropdown
        item
        onClick={item.onClick}
        icon={item.icon}
        name={item.name}
        text={item.text}
      >
        <Dropdown.Menu>{parseDropDownItems(item.subMenu)}</Dropdown.Menu>
      </Dropdown>
    </Menu.Menu>
  );
}

function parseDropDownItems(items: Array<MenuItem>): ReactNode {
  return items.map((item) => {
    if (item.type === "item") return processAsDropDownItem(item);
    else {
      // <span>{item.node}</span>;
      return parseDropDownItems(item.subMenu);      
    }
  });
}

function processAsDropDownItem(item: MenuItem): ReactNode {
  return (
    <Dropdown.Item onClick={item.onClick} name={item.name} key={item.name}>
      {item.node}
    </Dropdown.Item>
  );
}

export default Header;
