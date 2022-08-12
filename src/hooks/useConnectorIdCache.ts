import { GHostPackageEvent, GHostWebSocket } from "../services/GHostWebsocket";
import { useEffect, useReducer } from "react";
import { ServerResolveConnectorIds } from "./../models/websocket/ServerResolveConnectorIds";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_RESOLVE_CONNECTOR_IDS_RESPONSE,
} from "./../models/websocket/HeaderConstants";
import { CacheConnectorIdAction, CachedConnetcorIds } from "../context";

interface ConnectorIdProps {
  ghostSocket: GHostWebSocket;
}

export const useConnectorIdCache = ({ ghostSocket }: ConnectorIdProps) : [CachedConnetcorIds, React.Dispatch<CacheConnectorIdAction>] => {
  const authReducer = (
    state: CachedConnetcorIds,
    action: CacheConnectorIdAction
  ) => {
    if (action.action === "cache") return { ...state, ...action.payload };
    else if (action.action === "clear") return {};
    else if (action.action === "remove") {
      action.payload.forEach((i) => {
        delete state[i];
      });

      return { ...state };
    }

    return state;
  };

  const [cachedConnectorIds, dispatchCacheConnectorId] = useReducer(
    authReducer,
    {"1" : "Sangonomiya Kokomi"}
  );

  useEffect(() => {
    const onPacket = (packet: GHostPackageEvent) => {
      
      console.log(packet.detail.package);

      if (
        packet.detail.package.context === DEFAULT_CONTEXT_HEADER_CONSTANT &&
        packet.detail.package.type === DEFAULT_RESOLVE_CONNECTOR_IDS_RESPONSE
      ) {
        const response = packet.detail.package as ServerResolveConnectorIds;

        dispatchCacheConnectorId({
          action: "cache",
          payload: response.connectorIds,
        });
      }
    };

    ghostSocket.addEventListener("package", onPacket);

    return () => {
      ghostSocket.removeEventListener("package", onPacket);
    };
  }, [ghostSocket]);

  return [cachedConnectorIds, dispatchCacheConnectorId];
};
