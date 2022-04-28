import { useEffect, useState } from "react";
import { GHostWebSocket } from "../services/GHostWebsocket";
import { GHostWebSocketOptions } from "./../services/GHostWebsocket";

export const useGHostSocket = (
  options: GHostWebSocketOptions
): [GHostWebSocket, boolean] => {
  const [ghostSocket] = useState<GHostWebSocket>(new GHostWebSocket(options));
  const [isSocketConnected, setSocketConnected] = useState<boolean>(false);

  useEffect(() => {
    const onOpen = () => {
      setSocketConnected(true);
    };
    const onClose = () => {
      setSocketConnected(false);
    };

    ghostSocket.addEventListener("open", onOpen);
    ghostSocket.addEventListener("close", onClose);

    ghostSocket.connect();

    return () => {
      ghostSocket.removeEventListener("open", onOpen);
      ghostSocket.removeEventListener("close", onClose);

      ghostSocket.destroy();
    };
  }, [ghostSocket]);

  return [ghostSocket, isSocketConnected];
};
