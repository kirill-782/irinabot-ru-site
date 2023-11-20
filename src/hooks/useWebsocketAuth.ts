import { useEffect, useReducer, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import { AuthAction, AuthData } from "../context";
import { ClientUserAuthConverter } from "../models/websocket/ClientUserAuth";
import { ServerAccessList } from "../models/websocket/ServerAccessList";
import { ServerApiToken } from "../models/websocket/ServerApiToken";
import { ServerError } from "../models/websocket/ServerError";
import { ServerUserAuth } from "../models/websocket/ServerUserAuth";
import { AccessMaskHolderImpl, AnonymousAccessMaskHolder } from "../utils/AccessMaskHolder";
import { AnonymousTokenHolder, ApiTokenJwtHolder } from "../utils/ApiTokenHolder";
import {
    GLOBAL_ACCESS_LIST,
    GLOBAL_ADD_INTEGRATION_RESPONSE,
    GLOBAL_API_TOKEN,
    GLOBAL_CONTEXT_HEADER_CONSTANT,
    GLOBAL_GET_ERROR,
    GLOBAL_USER_AUTH_RESPONSE,
} from "./../models/websocket/HeaderConstants";
import { GHostWebSocket, GHostPackageEvent } from "./../services/GHostWebsocket";

interface WebsocketAuthOptions {
    ghostSocket: GHostWebSocket;
}

const authReducer = (state: AuthData, action: AuthAction) => {
    if (action.action === "clearCredentials") {
        const newState: AuthData = { ...state, authCredentials: null };
        return newState;
    } else if (action.action === "clearAuth") {
        const newState: AuthData = {
            ...state,
            currentAuth: null,
            apiToken: new AnonymousTokenHolder(),
            accessMask: new AnonymousAccessMaskHolder(),
        };
        return newState;
    } else if (action.action === "saveAuth") {
        const newState: AuthData = {
            ...state,
            currentAuth: action.payload,
        };
        return newState;
    } else if (action.action === "saveCredentials") {
        const newState: AuthData = {
            ...state,
            authCredentials: action.payload,
        };
        return newState;
    } else if (action.action === "setForce") {
        const newState: AuthData = {
            ...state,
            forceLogin: action.payload,
        };
        return newState;
    } else if (action.action === "saveToken") {
        const newState: AuthData = {
            ...state,
            apiToken: new ApiTokenJwtHolder(action.payload),
        };
        return newState;
    } else if (action.action === "saveAccessMask") {
        return {
            ...state,
            accessMask: new AccessMaskHolderImpl(action.payload),
        };
    }

    return state;
};

export const useWebsocketAuth = ({
    ghostSocket,
}: WebsocketAuthOptions): [AuthData, React.Dispatch<AuthAction>, boolean] => {
    const [needRegistryModal, setNeedRegistryModal] = useState<boolean>(false);

    const [authState, authDispatcher] = useReducer(authReducer, {
        authCredentials: null,
        currentAuth: null,
        forceLogin: false,
        apiToken: new AnonymousTokenHolder(),
        accessMask: new AnonymousAccessMaskHolder(),
    });

    // Load localStorage auth

    useEffect(() => {
        if (window.localStorage.getItem("authTokenType") !== undefined) {
            const tokenType = parseInt(window.localStorage.getItem("authTokenType"));
            const token = window.localStorage.getItem("authToken");

            if (tokenType && token)
                authDispatcher({
                    action: "saveCredentials",
                    payload: { type: tokenType, token },
                });
        }
    }, []);

    // Register socket event listeners

    //const {language} = useContext(AppRuntimeSettingsContext);
    //const lang = language.languageRepository;

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
                e.detail.package.context === GLOBAL_CONTEXT_HEADER_CONSTANT &&
                e.detail.package.type === GLOBAL_USER_AUTH_RESPONSE
            ) {
                authDispatcher({
                    action: "saveAuth",
                    payload: e.detail.package as ServerUserAuth,
                });
                authDispatcher({
                    action: "setForce",
                    payload: false,
                });
            } else if (
                e.detail.package.context === GLOBAL_CONTEXT_HEADER_CONSTANT &&
                e.detail.package.type === GLOBAL_ADD_INTEGRATION_RESPONSE
            ) {
                authDispatcher({
                    action: "saveAuth",
                    payload: { ...authState.currentAuth, ...e.detail.package },
                });
            } else if (
                e.detail.package.context === GLOBAL_CONTEXT_HEADER_CONSTANT &&
                e.detail.package.type === GLOBAL_GET_ERROR
            ) {
                const errorData = e.detail.package as ServerError;

                if (errorData.errorCode === 0)
                    toast({
                        title: "Ошибка", // title: lang.hook_useWebsocketAuth_error,
                        description: errorData.description,
                        type: "error",
                        time: 10000,
                    });
                else if (errorData.errorCode === 0x10) setNeedRegistryModal(true);
                else if (errorData.errorCode === 1 && errorData.description === "") {
                    toast({
                        title: "Ошибка входа", // title: lang.hook_useWebsocketAuth_errorLogin,
                        description: "Сессия просрочена. Войдите заново", // description: lang.hook_useWebsocketAuth_errorSessionTimeout,
                        type: "error",
                        time: 10000,
                    });

                    window.localStorage.removeItem("authTokenType");
                    window.localStorage.removeItem("authToken");

                    authDispatcher({ action: "clearCredentials" });
                } else if (errorData.errorCode === 1 && errorData.description === "") {
                    toast({
                        title: "Ошибка входа", // title: lang.hook_useWebsocketAuth_errorLogin,
                        description: "Сессия просрочена. Войдите заново", // description: lang.hook_useWebsocketAuth_errorSessionTimeout,
                        type: "error",
                        time: 10000,
                    });
                }
            } else if (
                e.detail.package.context === GLOBAL_CONTEXT_HEADER_CONSTANT &&
                e.detail.package.type === GLOBAL_API_TOKEN
            ) {
                const token = e.detail.package as ServerApiToken;

                authDispatcher({ action: "saveToken", payload: token.token });
            } else if (
                e.detail.package.context === GLOBAL_CONTEXT_HEADER_CONSTANT &&
                e.detail.package.type === GLOBAL_ACCESS_LIST
            ) {
                const records = e.detail.package as ServerAccessList;

                authDispatcher({ action: "saveAccessMask", payload: records.records });
            }
        };

        const onClose = () => {
            authDispatcher({ action: "clearAuth" });
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
        if (authState.currentAuth === null && authState.authCredentials !== null && ghostSocket.isConnected()) {
            const converter = new ClientUserAuthConverter();
            ghostSocket.send(
                converter.assembly({
                    tokenType: authState.authCredentials.type,
                    token: authState.authCredentials.token,
                    force: authState.forceLogin,
                })
            );
        }
    }, [authState, ghostSocket]);

    // needRegistry modal toggler

    useEffect(() => {
        if ((authState.forceLogin || !authState.authCredentials) && needRegistryModal) setNeedRegistryModal(false);

        if (authState.currentAuth) setNeedRegistryModal(false);
    }, [authState, needRegistryModal]);

    return [authState, authDispatcher, needRegistryModal];
};
