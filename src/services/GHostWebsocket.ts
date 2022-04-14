import { AbstractConverter } from "../models/websocket/AbstractPackage";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_GAME_LIST,
  DEFAULT_MAP_INFO,
  DEFAULT_UDP_ANSWER,
  DEFAULT_WEBSOCKET_CONNECT_STATS,
  GLOBAL_GET_ERROR,
  GLOBAL_USER_AUTH_RESPONSE,
} from "../models/websocket/HeaderConstants";
import { ServerMapInfoConverter } from "../models/websocket/ServerMapInfo";
import { ServerGameListConverter } from "./../models/websocket/ServerGameList";
import { DataBuffer } from "./../utils/DataBuffer";
import { AbstractPackage } from "./../models/websocket/AbstractPackage";
import { ServerWebsocketConnectStatsConverter } from "../models/websocket/ServerWebsocketConnectStats";
import { GLOBAL_CONTEXT_HEADER_CONSTANT } from "./../models/websocket/HeaderConstants";
import { ServerUserAuthConverter } from "./../models/websocket/ServerUserAuth";
import { ServerErrorConverter } from "../models/websocket/ServerError";
import { ServerUDPAnswerConverter } from "./../models/websocket/ServerUDPAnswer";

export interface GHostWebSocketOptions {
  url: string;
  reconnectInterval?: number;
  autoReconnect?: boolean;
}

const packageHandlers = (() => {
  let handlers: Array<Array<AbstractConverter>> = [];

  handlers[DEFAULT_CONTEXT_HEADER_CONSTANT] = [];
  handlers[DEFAULT_CONTEXT_HEADER_CONSTANT][DEFAULT_GAME_LIST] =
    new ServerGameListConverter();
  handlers[DEFAULT_CONTEXT_HEADER_CONSTANT][DEFAULT_MAP_INFO] =
    new ServerMapInfoConverter();
  handlers[DEFAULT_CONTEXT_HEADER_CONSTANT][DEFAULT_WEBSOCKET_CONNECT_STATS] =
    new ServerWebsocketConnectStatsConverter();
  handlers[DEFAULT_CONTEXT_HEADER_CONSTANT][DEFAULT_UDP_ANSWER] =
    new ServerUDPAnswerConverter();

  handlers[GLOBAL_CONTEXT_HEADER_CONSTANT] = [];
  handlers[GLOBAL_CONTEXT_HEADER_CONSTANT][GLOBAL_GET_ERROR] =
    new ServerErrorConverter();
  handlers[GLOBAL_CONTEXT_HEADER_CONSTANT][GLOBAL_USER_AUTH_RESPONSE] =
    new ServerUserAuthConverter();

  return handlers;
})();

interface PackageEventDetail {
  package: AbstractPackage;
}

export class GHostPackageEvent extends CustomEvent<PackageEventDetail> {
  constructor(incomingPackage: AbstractPackage) {
    super("package", { detail: { package: incomingPackage } });
  }
}

interface MessageEventDetail {
  data: any;
}

export class GHostMessageEvent extends CustomEvent<MessageEventDetail> {
  constructor(data) {
    super("message", { detail: { data: data } });
  }
}

export interface GHostWebSocket {
  addEventListener(
    event: "package",
    callback: (data: GHostPackageEvent) => void
  ): void;
  addEventListener(
    event: "message",
    callback: (data: GHostMessageEvent) => void
  ): void;
  addEventListener(event: "open", callback: (data: Event) => void): void;
  addEventListener(event: "close", callback: (data: Event) => void): void;

  removeEventListener(
    event: "package",
    callback: (data: GHostPackageEvent) => void
  ): void;
  removeEventListener(
    event: "message",
    callback: (data: GHostMessageEvent) => void
  ): void;
  removeEventListener(event: "open", callback: (data: Event) => void): void;
  removeEventListener(event: "close", callback: (data: Event) => void): void;
}

export class GHostWebSocket extends EventTarget {
  private socketConnect: WebSocket;
  private options: GHostWebSocketOptions;

  constructor(options: GHostWebSocketOptions) {
    super();

    if (options.autoReconnect == undefined) options.autoReconnect = true;

    if (options.reconnectInterval == undefined)
      options.reconnectInterval = 3500;

    this.options = options;
  }

  public isConnected() {
    if (this.socketConnect != null)
      return this.socketConnect.readyState === WebSocket.OPEN;

    return false;
  }

  public reconnect() {
    this.disconnect();
    this.connect();
  }

  public disconnect() {
    this.socketConnect.close();

    this.deattachListeners();

    this.dispatchEvent(new CustomEvent("close"));
    if (this.options.autoReconnect) this.autoReconnect();
  }

  public connect() {
    this.socketConnect = new WebSocket(this.options.url);
    this.socketConnect.binaryType = "arraybuffer";

    this.attachListeners();
  }

  public destroy() {
    this.deattachListeners();

    this.socketConnect.close();
  }

  public send(outgoingPackage: ArrayBuffer) {
    this.socketConnect.send(outgoingPackage);
  }

  private attachListeners() {
    this.socketConnect.addEventListener("open", this.wsOnOpen);
    this.socketConnect.addEventListener("close", this.wsOnClose);
    this.socketConnect.addEventListener("error", this.wsOnError);
    this.socketConnect.addEventListener("message", this.wsOnMessage);
  }

  private deattachListeners() {
    this.socketConnect.removeEventListener("open", this.wsOnOpen);
    this.socketConnect.removeEventListener("close", this.wsOnClose);
    this.socketConnect.removeEventListener("error", this.wsOnError);
    this.socketConnect.removeEventListener("message", this.wsOnMessage);
  }

  private autoReconnect() {
    setTimeout(() => {
      if (this.socketConnect.readyState == WebSocket.CLOSED) this.reconnect();
    }, this.options.reconnectInterval);
  }

  private wsOnOpen = (event) => {
    this.dispatchEvent(new CustomEvent("open"));
  };

  private wsOnError = (event) => {};

  private wsOnClose = (event) => {
    console.log("wsOnClose");
    this.dispatchEvent(new CustomEvent("close"));

    if (this.options.autoReconnect) this.autoReconnect();
  };

  private wsOnMessage = (event: MessageEvent) => {
    this.dispatchEvent(new GHostMessageEvent(event.data));

    if (event.data instanceof ArrayBuffer) {
      const dataBuffer = new DataBuffer(event.data);

      const context = dataBuffer.getUint8();

      if (packageHandlers[context] == undefined) {
        console.log("Unknown context passed (" + context + ")");
        return;
      }

      const type = dataBuffer.getUint8();

      if (packageHandlers[context][type] == undefined) {
        console.log("Unknown type passed (" + type + ")");
        return;
      }

      let converter = packageHandlers[context][type];
      let incomingPackage = converter.parse(dataBuffer);

      this.dispatchEvent(new GHostPackageEvent(incomingPackage));
    }
  };
}
