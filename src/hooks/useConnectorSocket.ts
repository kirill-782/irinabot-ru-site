import { useEffect, useState } from "react";
import { ConnectorWebsocket, ConnectorWebsocketOptions } from "../services/ConnectorWebsocket";

export const useConnectorSocket = (options: ConnectorWebsocketOptions): [ConnectorWebsocket, boolean] => {
    const [connectorSocket] = useState<ConnectorWebsocket>(new ConnectorWebsocket(options));
    const [isSocketConnected, setSocketConnected] = useState<boolean>(false);

    useEffect(() => {
        const onOpen = () => {
            setSocketConnected(true);
        };
        const onClose = () => {
            setSocketConnected(false);
        };

        connectorSocket.addEventListener("open", onOpen);
        connectorSocket.addEventListener("close", onClose);

        connectorSocket.connect();

        return () => {
            connectorSocket.removeEventListener("open", onOpen);
            connectorSocket.removeEventListener("close", onClose);

            connectorSocket.destroy();
        };
    }, [connectorSocket]);

    return [connectorSocket, isSocketConnected];
};
