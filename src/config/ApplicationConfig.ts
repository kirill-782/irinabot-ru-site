const isProduction = process.env.NODE_ENV === "production";

export const WEBSOCKET_ENDPOINT = isProduction
    ? "wss://" + window.location.host + "/ghost/"
    : "wss://irinabot.ru/ghost/";
export const CONNECTOR_WEBSOCKET_ENDPOINT = "ws://127.0.0.1:8148/";
export const DEFAULT_THEME = "light";

export const SITE_TITLE = "IrInA Host Bot";
