import { useContext, useEffect, useState } from "react";
import { Icon, Label, Menu } from "semantic-ui-react";
import { WebsocketContext } from "../../context";
import { CONNECTOR_SYMMARY } from "../../models/websocket/HeaderConstants";
import { ConnectorPackageEvent } from "./../../services/ConnectorWebsocket";
import {
  ConnectorGame,
  ConnectorSummary,
} from "./../../models/websocket/ConnectorSummary";

function ConnectorIndicator() {
  const websocketContext = useContext(WebsocketContext);

  const [connectorGames, setConnectorGames] = useState<ConnectorGame[]>([]);

  useEffect(() => {
    const onConnectorSymmary = (e: ConnectorPackageEvent) => {
      if (e.detail.package.type == CONNECTOR_SYMMARY) {
        const symmary = e.detail.package as ConnectorSummary;

        setConnectorGames(symmary.games);
      }
    };

    websocketContext.connectorSocket.addEventListener(
      "package",
      onConnectorSymmary
    );

    return () => {
      websocketContext.connectorSocket.removeEventListener(
        "package",
        onConnectorSymmary
      );
    };
  });

  return (
    <Menu.Item>
      <Icon
        name="rss"
        color={websocketContext.isConnectorSocketConnected ? "green" : null}
      ></Icon>
      {connectorGames.length > 0 && (
        <Label floating color="red">
          {connectorGames.length}
        </Label>
      )}
    </Menu.Item>
  );
}

export default ConnectorIndicator;
