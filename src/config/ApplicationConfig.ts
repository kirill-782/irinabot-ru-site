const isProduction = process.env.NODE_ENV === "production";

const wsHost = window.location.host === "irinabot.com" ?  "irinabot.com" :  "ghost.services.irinabot.ru"

 export const WEBSOCKET_ENDPOINT = isProduction
     ? "wss://" + wsHost + "/ghost/"
     : "wss://ghost.services.irinabot.ru/ghost/";


//export const    WEBSOCKET_ENDPOINT = "ws://127.0.0.1:3698/"

export const CONNECTOR_WEBSOCKET_ENDPOINT = "ws://127.0.0.1:8148/";
export const DEFAULT_THEME = "light";

export const SITE_TITLE = "IrInA Host Bot";

