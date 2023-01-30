import { GHostWebSocket } from "./../services/GHostWebsocket";
import { ConnectorWebsocket } from "./../services/ConnectorWebsocket";
import { useEffect } from "react";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_UDP_ANSWER,
} from "../models/websocket/HeaderConstants";
import { toast } from "@kokomi/react-semantic-toasts";
import { ServerUDPAnswer } from "../models/websocket/ServerUDPAnswer";
import { ConnectorBrowserAddGameConverter } from "../models/websocket/ConnectorBrowserGameAdd";
interface useConnectorGameAddOptions {
  ghostSocket: GHostWebSocket;
  connectorSocket: ConnectorWebsocket;
}

export const useConnectorGameAdd = ({
  ghostSocket,
  connectorSocket,
}: useConnectorGameAddOptions) => {

  //const {language} = useContext(AppRuntimeSettingsContext);
  //const t = language.getString;

  useEffect(() => {
    const onUDPGameAddPackage = (data) => {
      if (
        data.detail.package.type === DEFAULT_UDP_ANSWER &&
        data.detail.package.context === DEFAULT_CONTEXT_HEADER_CONSTANT
      ) {
        if (connectorSocket.isConnected()) {
          toast({
            title: "Игра в коннектор отправлена", //  title: t("hook.useConnectorGameAdd.sended"),
            description: "Зайдите в LAN Warcraft III, чтобы войти", //  description: t("hook.useConnectorGameAdd.toLAN"),
            type: "success",
            time: 10000,
          });
          const udpAnswer = data.detail.package as ServerUDPAnswer;
          const converter = new ConnectorBrowserAddGameConverter();
          connectorSocket.send(converter.assembly({ data: udpAnswer.data }));
        }
      }
    };

    ghostSocket.addEventListener("package", onUDPGameAddPackage);

    return () => {
      ghostSocket.removeEventListener("package", onUDPGameAddPackage);
    };
  }, [ghostSocket, connectorSocket]);
};
