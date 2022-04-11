import { useEffect, useReducer, useState } from "react";
import { GHostWebSocket } from "../services/GHostWebsocket";
import { GHostWebSocketOptions } from "./../services/GHostWebsocket";

export const useGHostSocket = (options: GHostWebSocketOptions) => {

  const [ghostSocket, setGHostSocket] = useState<GHostWebSocket>(new GHostWebSocket(options));

  useEffect(() => {
    ghostSocket.connect();

    return () => {
      ghostSocket.destroy();
    };
  }, [ghostSocket]);

  return ghostSocket;
};
