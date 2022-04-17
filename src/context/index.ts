import { createContext } from "react";
import { ConnectorWebsocket } from "../services/ConnectorWebsocket";
import { GHostWebSocket } from "../services/GHostWebsocket";
import { MapService } from "../services/MapService";
import { MapUploaderService } from "../services/MapUploaderService";
import { ServerUserAuth } from "./../models/websocket/ServerUserAuth";

// Socket Context

export type WebsocketContextType = {
  ghostSocket: GHostWebSocket;
  isGHostSocketConnected: boolean;
  connectorSocket: ConnectorWebsocket;
  isConnectorSocketConnected: boolean;
};

export const WebsocketContext = createContext<WebsocketContextType>(null);

// Config Context

export type AppRuntimeSettingsContextType = {
  gameList: {
    locked: boolean;
    setLocked: (locked: ((locked: boolean) => boolean) | boolean) => void;
  };
};

export const AppRuntimeSettingsContext =
  createContext<AppRuntimeSettingsContextType>(null);

// Auth Context

export type AuthCredentials = {
  type: number;
  token: string;
};

export type AuthData = {
  currentAuth: ServerUserAuth;
  authCredentials: AuthCredentials;
};

export type AuthAction = {
  action: string;
  payload: ServerUserAuth | AuthCredentials;
};

export type AuthContextType = {
  dispatchAuth: React.Dispatch<AuthAction>;
  auth: AuthData;
};

export const AuthContext = createContext<AuthContextType>(null);

// RestApi context

export type RestContextType = {
  mapUploader: MapUploaderService
  mapsApi: MapService
};

export const RestContext = createContext<RestContextType>(null)