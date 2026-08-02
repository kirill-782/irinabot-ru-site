const isProduction = process.env.NODE_ENV === "production";

//const wsHost = window.location.host === "irinabot.com" ?  "irinabot.com" :  "ghost.services.irinabot.ru"

const wsHost = window.location.host === "irinabot.com" ?  "irinabot.com" :  "irinabot.ru"

export const WEBSOCKET_ENDPOINT = isProduction
     ? "wss://" + window.location.host + "/ghost/"
     : "wss://ghost.services.irinabot.ru/ghost/";


//export const    WEBSOCKET_ENDPOINT = "ws://127.0.0.1:3698/"

export const CONNECTOR_WEBSOCKET_ENDPOINT = "ws://127.0.0.1:8148/";
export const DEFAULT_THEME = "light";

export const SITE_TITLE = "IrInA Host Bot";

// Фичатогл: показывать действие NOTIFY в списке действий уровня градации банлиста.
// Пока бекенд с NOTIFY не раскатан в прод — держим выключенным (уровень скрыт из дропдауна).
export const BANLIST_NOTIFY_ACTION_ENABLED = false;

