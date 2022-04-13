import { AbstractConverter } from "../models/websocket/AbstractPackage";

import { DataBuffer } from "./../utils/DataBuffer";
import { AbstractPackage } from "./../models/websocket/AbstractPackage";
import { CONNECTOR_SYMMARY } from "../models/websocket/HeaderConstants";
import {
  ConnectorSummary,
  ConnectorSummaryConverter,
} from "./../models/websocket/ConnectorSummary";

export interface ConnectorWebsocketOptions {
  url: string;
  reconnectInterval?: number;
  autoReconnect?: boolean;
}

const packageHandlers = (() => {
  let handlers: Array<AbstractConverter> = [];

  handlers[CONNECTOR_SYMMARY] = new ConnectorSummaryConverter();

  return handlers;
})();

interface PackageEventDetail {
  package: AbstractPackage;
}

export class ConnectorPackageEvent extends CustomEvent<PackageEventDetail> {
  constructor(incomingPackage: AbstractPackage) {
    super("package", { detail: { package: incomingPackage } });
  }
}

interface MessageEventDetail {
  data: any;
}

export class ConnectorMessageEvent extends CustomEvent<MessageEventDetail> {
  constructor(data) {
    super("message", { detail: { data: data } });
  }
}

export interface ConnectorWebsocket {
  addEventListener(
    event: "package",
    callback: (data: ConnectorPackageEvent) => void
  ): void;
  addEventListener(
    event: "message",
    callback: (data: ConnectorMessageEvent) => void
  ): void;
  addEventListener(event: "open", callback: (data: Event) => void): void;
  addEventListener(event: "close", callback: (data: Event) => void): void;

  removeEventListener(
    event: "package",
    callback: (data: ConnectorPackageEvent) => void
  ): void;
  removeEventListener(
    event: "message",
    callback: (data: ConnectorMessageEvent) => void
  ): void;
  removeEventListener(event: "open", callback: (data: Event) => void): void;
  removeEventListener(event: "close", callback: (data: Event) => void): void;
}

export class ConnectorWebsocket extends EventTarget {
  private socketConnect: WebSocket;
  private options: ConnectorWebsocketOptions;

  constructor(options: ConnectorWebsocketOptions) {
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
    this.dispatchEvent(new ConnectorMessageEvent(event.data));

    if (event.data instanceof ArrayBuffer) {
      const dataBuffer = new DataBuffer(event.data);

      const type = dataBuffer.getUint8();

      if (packageHandlers[type] == undefined) {
        console.log("Unknown connector type passed (" + type + ")");
        return;
      }

      let converter = packageHandlers[type];
      let incomingPackage = converter.parse(dataBuffer);

      this.dispatchEvent(new ConnectorPackageEvent(incomingPackage));
    }
  };
}
