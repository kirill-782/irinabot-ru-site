import { useEffect, useReducer } from "react";
import { GHostWebSocket } from "../services/GHostWebsocket";
import { GHostWebSocketOptions } from "./../services/GHostWebsocket";

export const useGHostSocket = (options: GHostWebSocketOptions) => {
  const [ghostSocket, dispatchGHostSocket] = useReducer((state, action) => {
    if (action === "connect") state.connect();
    if (action === "destroy") state.destroy();
    return state;
  }, new GHostWebSocket(options));

  useEffect(() => {
    dispatchGHostSocket("connect");

    return () => {
      dispatchGHostSocket("destroy");
    };
  }, []);

  return ghostSocket;
};
