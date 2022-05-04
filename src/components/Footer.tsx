import { useContext, useState } from "react";
import { toast } from "react-semantic-toasts";
import { Icon, Menu } from "semantic-ui-react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../context";
import { Chat } from "./Chat";
import ConnectorIndicator from "./Footer/ConnectorIndicator";
import OnlineStatsCounter from "./Footer/OnlineStatsCounter";

function Footer(props) {
  const runTimeContext = useContext(AppRuntimeSettingsContext);
  const websocketContext = useContext(WebsocketContext);
  
  const [showChat, setShowShat] = useState(false);

  const refreshButtonOnClick = () => {
    runTimeContext.gameList.setLocked((locked) => {
      return !locked;
    });
  };

  const connectorClassList = runTimeContext.gameList.locked ? ["red"] : [];

  return (
    <>
      {showChat && <Chat />}
      <Menu text fixed="bottom" size="massive" className="footer-menu">
        <OnlineStatsCounter />
        <ConnectorIndicator />
        <Menu.Item title="Отображает состояние соединения с хостботом.">
          <Icon
            name="plug"
            color={websocketContext.isGHostSocketConnected ? "green" : null}
          ></Icon>
        </Menu.Item>
        <Menu.Item position="right" onClick={refreshButtonOnClick}>
          <Icon
            name="sync alternate"
            className={connectorClassList.join(" ")}
          ></Icon>
        </Menu.Item>
        <Menu.Item
          onClick={() => setShowShat(!showChat)}
        >
          <Icon name="envelope"></Icon>
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
      </Menu>
    </>
  );
}

export default Footer;
