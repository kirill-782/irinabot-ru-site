import { createContext } from "react";
import { GHostWebSocket } from "../services/GHostWebsocket";

export type WebsocketContextType = {
  ghostSocket: GHostWebSocket;
};

export const WebsocketContext = createContext<WebsocketContextType>(null);

export const AppRuntimeSettingsContext = createContext(null);
