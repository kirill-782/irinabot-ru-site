import React, { ReactNode } from "react";
import { Dropdown, Icon, Menu, SemanticICONS } from "semantic-ui-react";
import { useWindowSize } from "../hooks/useWindowSize";
import './Header.scss';

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
      <Menu className='mobile-menu'>
        <Menu.Item onClick={toggleMobileMenuList} content="Mobile Menu"></Menu.Item>
        <Dropdown
          item
          //onClick={}
          icon='dropdown'
          name='user-profile'
          trigger={<span><Icon name='user'/>Symmetra</span>}
          labeled
          className='user-profile-dropdown'
        >
          <Dropdown.Menu>
          <Dropdown.Item name='settings' key='1'>Настройки</Dropdown.Item>
            <Dropdown.Item name='exit' key='2'>Выход</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <div className="mobile-menu-list">
          {console.log(items)}
          {items.map((item) => {
            if (item.name === "logo" || item.name === "usermenu") return false;
            if (item.type === "item") return processAsMenuItem(item);
            else return processAsMenuDropDown(item);
          })}
        </div>
      </Menu>
    );
  }
}

function toggleMobileMenuList() {
  const mobileMenu = document.querySelector('.mobile-menu-list');
  mobileMenu.classList.toggle("active");
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
      <Icon name={item.icon} className={item.icon ? item.icon : 'no-icon'} />
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
