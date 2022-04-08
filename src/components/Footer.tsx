import { useContext } from "react";
import { toast } from "react-semantic-toasts";
import { Icon, Label, Menu } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../context";
import OnlineStatsCounter from "./Footer/OnlineStatsCounter";

function Footer(props)
{
    const runTimeContext = useContext(AppRuntimeSettingsContext);

    const refreshButtonOnClick = () => {
        runTimeContext.gameList.setLocked((locked) => {
            return !locked;
        })
    }

    const connectorClassList = runTimeContext.gameList.locked ? ["red"] : [];

    return (
        <Menu
            text
            fixed="bottom"
            size="massive"
        >
            <OnlineStatsCounter />
            <Menu.Item>
                <Icon name="rss" color="green"></Icon>
                <Label floating color="red">1</Label>
            </Menu.Item>
            <Menu.Item position="right" onClick={refreshButtonOnClick}>
                <Icon name="refresh" className={connectorClassList.join(" ")}></Icon>
            </Menu.Item>
            <Menu.Item onClick={()=>toast({"type":"error", title:"Не поддерживается"})}>
                <Icon name="envelope"></Icon>
            </Menu.Item>
            <Menu.Item as="a" href="https://discordapp.com/invite/zFZsGTQ" onClick={(e)=>{window.open("https://discordapp.com/invite/zFZsGTQ"); e.preventDefault() }}>
                <Icon name="discord"></Icon>
            </Menu.Item>
            <Menu.Item as="a" href="https://vk.com/irina_bot" onClick={(e)=>{window.open("https://vk.com/irina_bot"); e.preventDefault() }}>
                <Icon name="vk"></Icon>
            </Menu.Item>
        </Menu>
    );
} 

export default Footer;