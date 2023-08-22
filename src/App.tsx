import React, { useEffect, useState } from "react";
import {
    AppRuntimeSettingsContext,
    AuthAction,
    AuthContext,
    AuthData,
    SelectUserFunctionHolder,
    WebsocketContext,
} from "./context";
import "@kokomi/react-semantic-toasts/styles/react-semantic-alert.css";

import "./components/Slider.scss";
import { useGHostSocket } from "./hooks/useGHostSocket";
import { useWebsocketAuth } from "./hooks/useWebsocketAuth";
import { useConnectorSocket } from "./hooks/useConnectorSocket";
import { useConnectorGameAdd } from "./hooks/useConnectorGameAdd";
import RegisterAccountModal from "./components/Modal/RegisterAccountModal";
import { CONNECTOR_WEBSOCKET_ENDPOINT, WEBSOCKET_ENDPOINT } from "./config/ApplicationConfig";

import AfterContextApp from "./AfterContextApp";
import RouteList from "./components/RouteList";
import { getLocale } from "./utils/LocaleUtils";

import { loadTheme } from "./utils/Theme";
import SitePrepareLoader from "./components/SitePrepareLoader";
import { useLanguage } from "./hooks/useLanguage";
import { Header } from "semantic-ui-react";

function App() {
    const [ghostSocket, isGHostSocketConnected] = useGHostSocket({
        url: WEBSOCKET_ENDPOINT,
    });

    const [connectorSocket, isConnectorSocketConnected] = useConnectorSocket({
        url: CONNECTOR_WEBSOCKET_ENDPOINT,
    });
    const [gameListLocked, setGameListLocked] = useState(false);
    const [linkCopyMode, setLinkCopyMode] = useState(localStorage.getItem("linkCopyMode") === "1");

    useEffect(() => {
        localStorage.setItem("linkCopyMode", linkCopyMode ? "1" : "0");
    }, [linkCopyMode]);

    const [authState, authDispatcher, needRegisterModal] = useWebsocketAuth({
        ghostSocket,
    });

    useConnectorGameAdd({ ghostSocket, connectorSocket, linkCopyMode });

    const [selectUser, setSelectUser] = useState<SelectUserFunctionHolder>({
        selectUser: () => {},
    });

    const [selectLanguage, pushLanguageData, getString, currentLocale, data] = useLanguage();

    // Фиксики останутся пока не загрузятся стили и языки

    const [dynamicImportReady, setDynamicImportReady] = useState(false);
    const [dynamicImportError, setDynamicImportError] = useState("");

    useEffect(() => {
        const theme = new Promise((resolve, reject) => {
            loadTheme().finally(() => {
                resolve(undefined);
            });
        });
        const locale = getLocale();
        Promise.all([theme, selectLanguage(locale)])
            .then(() => {
                setDynamicImportReady(true);
            })
            .catch((e) => {
                setDynamicImportError(JSON.stringify(e));
            });
    }, []);

    if (dynamicImportError) {
        return <Header>{dynamicImportError}</Header>;
    }

    if (!dynamicImportReady) {
        return <SitePrepareLoader noWait />;
    }

    return (
        <WebsocketContext.Provider
            value={{
                ghostSocket,
                isGHostSocketConnected,
                connectorSocket,
                isConnectorSocketConnected,
            }}
        >
            <AppRuntimeSettingsContext.Provider
                value={{
                    linkCopyMode: { copy: linkCopyMode, setCopy: setLinkCopyMode },
                    gameList: { locked: gameListLocked, setLocked: setGameListLocked },
                    chat: {
                        selectUser,
                        setSelectUser,
                    },
                    language: {
                        selectLanguage,
                        getString,
                        currentLocale,
                        languageRepository: data,
                    },
                }}
            >
                <AuthContext.Provider
                    value={{
                        auth: authState as AuthData,
                        dispatchAuth: authDispatcher as React.Dispatch<AuthAction>,
                    }}
                >
                    <AfterContextApp>
                        <RouteList />
                        <RegisterAccountModal
                            open={needRegisterModal}
                            onApprove={() => {
                                authDispatcher({ action: "setForce", payload: true });
                            }}
                            onReject={() => {
                                authDispatcher({ action: "clearCredentials" });
                            }}
                        ></RegisterAccountModal>
                    </AfterContextApp>
                </AuthContext.Provider>
            </AppRuntimeSettingsContext.Provider>
        </WebsocketContext.Provider>
    );
}

export default App;
