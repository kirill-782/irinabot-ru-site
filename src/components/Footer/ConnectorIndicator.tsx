import { useContext, useEffect, useState } from "react";
import { Icon, Label, Menu } from "semantic-ui-react";
import { WebsocketContext } from "../../context";
import { CONNECTOR_SYMMARY } from "../../models/websocket/HeaderConstants";
import { ConnectorPackageEvent } from "./../../services/ConnectorWebsocket";
import {
  ConnectorGame,
  ConnectorSummary,
} from "./../../models/websocket/ConnectorSummary";
import ConnectorSummaryModal from "../Modal/ConnectorSummaryModal";

function ConnectorIndicator() {
  const websocketContext = useContext(WebsocketContext);

  const [connectorGames, setConnectorGames] = useState<ConnectorGame[]>([]);

  useEffect(() => {
    const onConnectorSymmary = (e: ConnectorPackageEvent) => {
      if (e.detail.package.type === CONNECTOR_SYMMARY) {
        const summary = e.detail.package as ConnectorSummary;

        setConnectorGames(summary.games);
      }
    };

    const onConnectorSocketClose = () => {
      setConnectorGames([]);
    };

    websocketContext.connectorSocket.addEventListener(
      "package",
      onConnectorSymmary
    );

    websocketContext.connectorSocket.addEventListener(
      "close",
      onConnectorSocketClose
    );

    return () => {
      websocketContext.connectorSocket.removeEventListener(
        "package",
        onConnectorSymmary
      );

      websocketContext.connectorSocket.removeEventListener(
        "close",
        onConnectorSocketClose
      );
    };
  });

  const [connectorSummaryModalOpen, setConnectorSummaryModalOpen] =
    useState(false);

  return (
    <Menu.Item>
      <Icon
        name="rss"
        color={
          websocketContext.isConnectorSocketConnected ? "green" : undefined
        }
        onClick={() => setConnectorSummaryModalOpen(true)}
      ></Icon>
      <ConnectorSummaryModal
        connectorGames={connectorGames}
        open={connectorSummaryModalOpen}
        onClose={() => setConnectorSummaryModalOpen(false)}
      />

      {connectorGames.length > 0 && (
        <Label floating color="red">
          {connectorGames.length}
        </Label>
      )}
    </Menu.Item>
  );
}

export default ConnectorIndicator;
