const isProduction = process.env.NODE_ENV === "production";

export const WEBSOCKET_ENDPOINT2 = isProduction
    ? "wss://" + window.location.host + "/ghost/"
    : "wss://irinabot.ru/ghost/";

export const WEBSOCKET_ENDPOINT = "wss://irinabot.ru/ghost/";
//export const WEBSOCKET_ENDPOINT = "ws://127.0.0.1:3698/ghost/";

export const WEBSOCKET_ENV = (() => {
    if (WEBSOCKET_ENDPOINT.includes("irinabot.ru")) return "prod";

    if (WEBSOCKET_ENDPOINT.includes("localhost") || WEBSOCKET_ENDPOINT.includes("127.0.0.1")) return "dev";

    return "test";

})();

export const CONNECTOR_WEBSOCKET_ENDPOINT = "ws://127.0.0.1:8148/";
export const DEFAULT_THEME = "light";

export const SITE_TITLE = "IrInA Host Bot";
