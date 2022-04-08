import React, { useContext, useEffect, useState } from "react";
import { Menu } from "semantic-ui-react";
import { WebsocketContext } from "../../context";
import { ClientWebsocketConnectStatsConverter } from "../../models/websocket/ClientWebsocketConnectStats";
import { DEFAULT_WEBSOCKET_CONNECT_STATS } from "../../models/websocket/HeaderConstants";
import { ServerWebsocketConnectStats } from "../../models/websocket/ServerWebsocketConnectStats";
import { GHostPackageEvent } from "../../services/GHostWebsocket";

interface OnlineStatsCounterProps
{
    showAlways?: boolean
}

function OnlineStatsCounter({showAlways}: OnlineStatsCounterProps) {

    let sockets = useContext(WebsocketContext);

    let sendStatsRequest = ()=>{
        if(sockets.ghostSocket.isConnected( ))
        {
            let clientWebsocketConnectStatsConverter = new ClientWebsocketConnectStatsConverter();
            sockets.ghostSocket.send(clientWebsocketConnectStatsConverter.assembly({}));
        }
    }

    const [connected, setConnected] = useState(0);
    const [logined, setLogined] = useState(0);


    useEffect(()=>{

        let intervalId;

        if(sockets.ghostSocket.isConnected( ))
            sendStatsRequest();

        const onConnectedCount = (event: GHostPackageEvent) =>
        {
            if(event.detail.package.type == DEFAULT_WEBSOCKET_CONNECT_STATS)
            {
                const stats: ServerWebsocketConnectStats = event.detail.package as ServerWebsocketConnectStats;
                setConnected(stats.connected);
                setLogined(stats.logined);

                clearTimeout(intervalId);
                intervalId = setTimeout(sendStatsRequest, 5000);
            }  
        }

        const onConnectClose = () =>
        {
            clearTimeout(intervalId);
            intervalId = null;
        }

        const onConnectOpen = () => sendStatsRequest( );

        sockets.ghostSocket.addEventListener('package', onConnectedCount);
        sockets.ghostSocket.addEventListener('open', onConnectOpen);
        sockets.ghostSocket.addEventListener('close', onConnectClose);

        return () => {
            clearTimeout(intervalId);
            sockets.ghostSocket.removeEventListener('package', onConnectedCount);
            sockets.ghostSocket.removeEventListener('open', onConnectOpen);
            sockets.ghostSocket.removeEventListener('close', onConnectClose);
        }

    }, []) 

    return (
        showAlways || logined > 0 ? <Menu.Item title={"Всего: " + connected}>{logined}</Menu.Item> : null
    )
} 

export default OnlineStatsCounter;