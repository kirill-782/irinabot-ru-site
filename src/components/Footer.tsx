import React from "react";
import { useContext, useState } from "react";
import { Icon, Label, Menu } from "semantic-ui-react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../context";
import { Chat } from "./Chat";
import OnlineStatsCounter from "./Footer/OnlineStatsCounter";

function Footer(props) {
    const runTimeContext = useContext(AppRuntimeSettingsContext);
    const websocketContext = useContext(WebsocketContext);

    const [showChat, setShowShat] = useState(false);
    const [hasUnreadMessages, setUnreadMessages] = useState(false);

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const refreshButtonOnClick = () => {
        runTimeContext.gameList.setLocked((locked) => {
            return !locked;
        });
    };

    const connectorClassList = runTimeContext.gameList.locked ? ["red"] : [];

    return (
        <>
            <Chat open={showChat} setOpen={setShowShat} setUnreadMessages={setUnreadMessages} />
            <Menu text fixed="bottom" size="massive" className="footer-menu">
                <OnlineStatsCounter />
                <Menu.Item title={t("footerHostbotWebsocketHint")}>
                    <Icon name="plug" color={websocketContext.isGHostSocketConnected ? "green" : undefined}></Icon>
                </Menu.Item>
                <Menu.Item position="right" onClick={refreshButtonOnClick}>
                    <Icon name="sync alternate" className={connectorClassList.join(" ")}></Icon>
                </Menu.Item>
                <Menu.Item onClick={() => setShowShat(!showChat)}>
                    <Icon name="envelope"></Icon>
                    {hasUnreadMessages && <Label circular color="red" empty floating />}
                </Menu.Item>
                <Menu.Item
                    as="a"
                    href="https://discordapp.com/invite/zFZsGTQ"
                    onClick={(e) => {
                        window.open("https://discordapp.com/invite/zFZsGTQ");
                        e.preventDefault();
                    }}
                >
                    <Icon name="discord"></Icon>
                </Menu.Item>
                <Menu.Item
                    as="a"
                    href="https://vk.com/irina_bot"
                    onClick={(e) => {
                        window.open("https://vk.com/irina_bot");
                        e.preventDefault();
                    }}
                >
                    <Icon name="vk"></Icon>
                </Menu.Item>
                <Menu.Item
                    as="a"
                    href="https://t.me/irina_hostbot"
                    onClick={(e) => {
                        window.open("https://t.me/irina_hostbot");
                        e.preventDefault();
                    }}
                >
                    <Icon name="telegram plane"></Icon>
                </Menu.Item>
                <Menu.Item
                    as="a"
                    href="https://boosty.to/irina_bot?utm_source=irinabot&utm_medium=footer&utm_campaign=none"
                    onClick={(e) => {
                        window.open("https://boosty.to/irina_bot?utm_source=irinabot&utm_medium=footer&utm_campaign=none");
                        e.preventDefault();
                    }}
                >
                    <i className="icon" aria-hidden="true">
                        <svg style={{width: "100%", height: "100%"}} version="1.1" viewBox="44 51 147 190">
                            <path fill="currentColor" d="M44.3,164.5L76.9,51.6H127l-10.1,35c-0.1,0.2-0.2,0.4-0.3,0.6L90,179.6h24.8c-10.4,25.9-18.5,46.2-24.3,60.9
                                    c-45.8-0.5-58.6-33.3-47.4-72.1 M90.7,240.6l60.4-86.9h-25.6l22.3-55.7c38.2,4,56.2,34.1,45.6,70.5
                                    c-11.3,39.1-57.1,72.1-101.7,72.1C91.3,240.6,91,240.6,90.7,240.6z"/>
                        </svg>
                    </i>
                </Menu.Item>
                <Menu.Item
                    as="a"
                    href="https://github.com/kirill-782/irinabot-ru-site"
                    onClick={(e) => {
                        window.open("https://github.com/kirill-782/irinabot-ru-site");
                        e.preventDefault();
                    }}
                >
                    <Icon name="github"></Icon>
                </Menu.Item>
            </Menu>
        </>
    );
}

export default Footer;
