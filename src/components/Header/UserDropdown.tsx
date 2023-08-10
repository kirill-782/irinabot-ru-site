import React from "react";
import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { Dropdown } from "semantic-ui-react";
import { AppRuntimeSettingsContext, AuthContext, WebsocketContext } from "../../context";
import AccessListModal from "../Modal/AccessListModal";
import { AccessMaskBit } from "../Modal/AccessMaskModal";
import UserSettingsModal from "../Modal/UserSettingsModal";
import WarcraftIIIText from "../WarcraftIIIText";

function UserDrowdown() {
    const authContext = useContext(AuthContext);
    const sockets = useContext(WebsocketContext);

    const [userSettingsModalOpen, setUserSettingsModalOpen] = useState(false);
    const [userAccessModalOpen, setUserAccessModalOpen] = useState(false);

    const { currentAuth, accessMask } = authContext.auth;

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

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
                trigger={
                    currentAuth.connectorName.length > 0 ? (
                        <WarcraftIIIText>{
                            (accessMask.hasAccess(1) ? currentAuth.nicknamePrefix : "")
                            + currentAuth.connectorName}</WarcraftIIIText>
                    ) : (
                        currentAuth.nickname
                    )
                }
                item
            >
                <Dropdown.Menu>
                    <Dropdown.Item
                        disabled={!authContext.auth.accessMask.hasAccess(AccessMaskBit.GAME_CREATE)}
                        as={NavLink}
                        to="/create"
                    >
                        {lang.userDropdownCreateGame}
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => {
                            setUserSettingsModalOpen(true);
                        }}
                    >
                        {lang.userDropdownSettings}
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => {
                            setUserAccessModalOpen(true);
                        }}
                    >
                        {lang.userDropdownAccessList}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={logout}>{lang.userDropdownLogout}</Dropdown.Item>
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
