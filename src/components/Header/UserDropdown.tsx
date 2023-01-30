import React from "react";
import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { Dropdown } from "semantic-ui-react";
import { AppRuntimeSettingsContext, AuthContext, WebsocketContext } from "../../context";
import AccessListModal from "../Modal/AccessListModal";
import { AccessMaskBit } from "../Modal/AccessMaskModal";
import UserSettingsModal from "../Modal/UserSettingsModal";

function UserDrowdown() {
  const authContext = useContext(AuthContext);
  const sockets = useContext(WebsocketContext);

  const [userSettingsModalOpen, setUserSettingsModalOpen] = useState(false);
  const [userAccessModalOpen, setUserAccessModalOpen] = useState(false);

  const currentAuth = authContext.auth.currentAuth;

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  
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
          <Dropdown.Item
            disabled={
              !authContext.auth.accessMask.hasAccess(AccessMaskBit.GAME_CREATE)
            }
            as={NavLink}
            to="/create"
          >
            {t("menu.user.create")}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              setUserSettingsModalOpen(true);
            }}
          >
            {t("menu.user.settings")}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              setUserAccessModalOpen(true);
            }}
          >
            {t("menu.user.accessList")}
          </Dropdown.Item>
          <Dropdown.Item onClick={logout}>{t("menu.user.logout")}</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <UserSettingsModal
        closeIcon
        open={userSettingsModalOpen}
        onClose={() => {
          setUserSettingsModalOpen(false);
        }}
      />
      <AccessListModal
        open={userAccessModalOpen}
        onClose={() => {
          setUserAccessModalOpen(false);
        }}
      />
    </>
  );
}

export default UserDrowdown;
