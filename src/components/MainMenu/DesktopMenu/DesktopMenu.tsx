import React, { ReactNode, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Icon, Menu, SemanticICONS, Message } from "semantic-ui-react";
import LoginDropdown from "../../Header/LoginDropdown";
import UserDrowdown from "../../Header/UserDropdown";
import { AppRuntimeSettingsContext, AuthContext } from "../../../context";
import { switchTheme, E_THEME, currentTheme } from "../../../utils/Theme";
import "./DesktopMenu.scss";
import UtilsDropdown from "../../Header/UtilsDropdown";
import LanguageDropdown from "../../Header/LanguageDropdown";
import { WEBSOCKET_ENV } from "../../../config/ApplicationConfig";

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

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const tryTopScroll = () => {
        window.scrollTo(0, 0);
    };

    return (
        <Menu fixed="top" inverted className="main-menu">
            <Menu.Item as={NavLink} to="/">
                IrInA Host B<Icon name="circle" style={{ margin: 0 }} />T
            </Menu.Item>
            <Menu.Item as={NavLink} icon="gamepad" to="/gamelist" title={lang.menuActiveGames} onClick={tryTopScroll} />
            <Menu.Item as={NavLink} icon="file" to="/maps" title={lang.menuMapList} onClick={tryTopScroll} />
            <Menu.Item as={NavLink} title={lang.menuHelp} icon="help" to="/wiki/irina-help/how-to-play" />
            <Menu.Item
                onClick={() => {
                    switchTheme(currentTheme === E_THEME.LIGHT ? E_THEME.DARK : E_THEME.LIGHT);
                }}
            >
                <Icon name={currentTheme === E_THEME.DARK ? "sun" : "moon"} style={{ margin: 0 }} />
            </Menu.Item>

            <Menu.Menu position="right">
                <Message  error={WEBSOCKET_ENV === "prod"}>{WEBSOCKET_ENV}</Message>
            </Menu.Menu>

            <Menu.Menu position="right">
                <UtilsDropdown />
                <Menu.Item as={NavLink} to="/autopay">
                    <Icon name="ruble sign" />
                    {lang.menuAutoPay}
                </Menu.Item>

                <LanguageDropdown />
                {currentAuth !== null ? <UserDrowdown /> : <LoginDropdown />}
            </Menu.Menu>
        </Menu>
    );
};

export default DesktopMenu;
