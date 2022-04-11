export const GLOBAL_CONTEXT_HEADER_CONSTANT = 0x00;

// Server answer constant
export const GLOBAL_GET_ERROR = 0x00;
export const GLOBAL_PONG = 0x02;
export const GLOBAL_USER_AUTH_RESPONSE = 0x03;
export const GLOBAL_BNET_KEY = 0x04;
export const GLOBAL_INTEGRATION_BY_TOKEN = 0x05;
export const GLOBAL_SET_CONNECTOR_NAME = 0x06;
export const GLOBAL_DELETE_INTEGRATION = 0x07;

// Client request constant
export const GLOBAL_SEND_ERROR = 0x00;
export const GLOBAL_PING = 0x02;
export const GLOBAL_USERAUTH = 0x03;
export const GLOBAL_GETBNETKEY = 0x04;
export const GLOBAL_ADD_INTEGRATION_BY_TOKEN = 0x05;

export const DEFAULT_CONTEXT_HEADER_CONSTANT = 0x01;

// Server answer constant
export const DEFAULT_CONTEXT_WELCOME = 0x00;
export const DEFAULT_GAME_LIST = 0x01;
export const DEFAULT_UDP_ANSWER = 0x03;
export const DEFAULT_CREATE_GAME_RESPONSE = 0x04;
export const DEFAULT_WEBSOCKET_CONNECT_STATS = 0x05;
export const DEFAULT_NEW_MESSAGE = 0x0c;
export const DEFAULT_MAP_INFO = 0x0d;

// Client request constant
export const DEFAULT_CONTEXT_REQEST = 0x00;
export const DEFAULT_GET_GAMELIST = 0x01;
export const DEFAULT_SEND_GAME_EXTERNAL_SIGNAL = 0x02;
export const DEFAULT_GET_UDP_GAME = 0x03;
export const DEFAULT_CREATE_GAME = 0x04;
export const DEFAULT_GET_WEBSOCKETCONNECTS_STATS = 0x05;
export const DEFAULT_SEND_MESSAGE = 0x0c;
export const DEFAULT_GET_MAPINFO = 0x0d;
