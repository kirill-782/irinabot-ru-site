import React from "react";
import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { Dropdown } from "semantic-ui-react";
import { AuthContext, WebsocketContext } from "../../context";
import AccessListModal from "../Modal/AccessListModal";
import UserSettingsModal from "../Modal/UserSettingsModal";

function UserDrowdown() {
  const authContext = useContext(AuthContext);
  const sockets = useContext(WebsocketContext);

  const [userSettingsModalOpen, setUserSettingsModalOpen] = useState(false);
  const [userAccessModalOpen, setUserAccessModalOpen] = useState(false);

  const currentAuth = authContext.auth.currentAuth;

  const logout = () => {
    window.localStorage.removeItem("authTokenType");
    window.localStorage.removeItem("authToken");

    authContext.dispatchAuth({ action: "clearCredentials" });

    // Socket dont support logout frame
    sockets.ghostSocket.disconnect();
  };

  return (
    <>
      <Dropdown
        text={
          currentAuth.connectorName.length > 0
            ? currentAuth.connectorName
            : currentAuth.nickname
        }
        item
      >
        <Dropdown.Menu>
          <Dropdown.Item as={NavLink} to="/create">
            Создать игру
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              setUserSettingsModalOpen(true);
            }}
          >
            Настройки
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              setUserAccessModalOpen(true);
            }}
          >
            Список прав
          </Dropdown.Item>
          <Dropdown.Item onClick={logout}>Выйти</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <UserSettingsModal
        closeIcon
        open={userSettingsModalOpen}
        onClose={() => {
          setUserSettingsModalOpen(false);
        }}
      />
      <AccessListModal open={userAccessModalOpen} onClose={() => {
        setUserAccessModalOpen(false);
      }}/>
    </>
  );
}

export default UserDrowdown;
