import { useContext, useEffect, useReducer } from "react";
import {
  AuthAction,
  AuthCredentials,
  AuthData,
  WebsocketContext,
} from "../context";
import { ClientUserAuthConverter } from "../models/websocket/ClientUserAuth";
import { ServerUserAuth } from "../models/websocket/ServerUserAuth";
import {
  GHostPackageEvent,
  GHostWebSocket,
} from "./../services/GHostWebsocket";
import {
  GLOBAL_CONTEXT_HEADER_CONSTANT,
  GLOBAL_USER_AUTH_RESPONSE,
} from "./../models/websocket/HeaderConstants";

interface WebsocketAuthOptions {
  ghostSocket: GHostWebSocket;
}

export const useWebsocketAuth = ({ ghostSocket }: WebsocketAuthOptions) => {
  const sockets = useContext(WebsocketContext);

  const [authState, authDispatcher] = useReducer(
    (state: AuthData, action: AuthAction) => {
      console.log(state, action);
      if (action.action == "clearCredentials") {
        const newState: AuthData = { ...state, authCredentials: null };
        return newState;
      } else if (action.action == "clearAuth") {
        const newState: AuthData = { ...state, currentAuth: null };
        return newState;
      } else if (action.action == "saveAuth") {
        const newState: AuthData = {
          ...state,
          currentAuth: action.payload as ServerUserAuth,
        };
        return newState;
      } else if (action.action == "saveCredentials") {
        const newState: AuthData = {
          ...state,
          authCredentials: action.payload as AuthCredentials,
        };
        return newState;
      }

      return state;
    },
    { authCredentials: null, currentAuth: null }
  );

  // Load localStorage auth

  useEffect(() => {
    if (window.localStorage.getItem("authTokenType") != undefined) {
      const tokenType = parseInt(window.localStorage.getItem("authTokenType"));
      const token = window.localStorage.getItem("authToken");

      authDispatcher({
        action: "saveCredentials",
        payload: { type: tokenType, token },
      });
    }
  }, []);

  // Register socket event listeners

  useEffect(() => {
    const onOpen = () => {
      if (authState.authCredentials !== null) {
        const converter = new ClientUserAuthConverter();
        ghostSocket.send(
          converter.assembly({
            tokenType: authState.authCredentials.type,
            token: authState.authCredentials.token,
            force: false,
          })
        );
      }
    };

    const onPackage = (e: GHostPackageEvent) => {
      if (
        e.detail.package.context == GLOBAL_CONTEXT_HEADER_CONSTANT &&
        e.detail.package.type == GLOBAL_USER_AUTH_RESPONSE
      ) {
        authDispatcher({
          action: "saveAuth",
          payload: e.detail.package as ServerUserAuth,
        });
      }
    };

    const onClose = () => {
      authDispatcher({ action: "clearAuth", payload: null });
    };

    ghostSocket.addEventListener("open", onOpen);
    ghostSocket.addEventListener("package", onPackage);
    ghostSocket.addEventListener("close", onClose);

    return () => {
      ghostSocket.removeEventListener("open", onOpen);
      ghostSocket.removeEventListener("package", onPackage);
      ghostSocket.removeEventListener("close", onClose);
    };
  }, [ghostSocket, authState]);

  // Send after recording authCredentials to websocket if not auth

  useEffect(() => {
    if (
      authState.currentAuth === null &&
      authState.authCredentials !== null &&
      ghostSocket.isConnected()
    ) {
      const converter = new ClientUserAuthConverter();
      ghostSocket.send(
        converter.assembly({
          tokenType: authState.authCredentials.type,
          token: authState.authCredentials.token,
          force: false,
        })
      );
    }
  }, [authState, ghostSocket]);

  return [authState, authDispatcher];
};
