import { AdditionalFlags, MapService } from "./MapService";
import { Map } from "../models/rest/Map";
import { Flags } from "../models/rest/Flags";

export interface UploadMapEntry {
  file: File;
  flags: Flags;
  additionalFlags: AdditionalFlags;
}

export interface UploadMapStartEventDetail {
  entry: UploadMapEntry;
  remain: number;
}

export interface UploadMapCompleteEventDetail {
  map: Map;
  error: any;
  remain: number;
}

export interface UploadMapProgressEventDetail {
  entry: UploadMapEntry;
  loaded: number;
  total: number;
}

export class UploadMapStartEvent extends CustomEvent<UploadMapStartEventDetail> {
  constructor(data: UploadMapStartEventDetail) {
    super("start", { detail: data });
  }
}

export class UploadMapCompleteEvent extends CustomEvent<UploadMapCompleteEventDetail> {
  constructor(data: UploadMapCompleteEventDetail) {
    super("complete", { detail: data });
  }
}

export class UploadMapProgressEvent extends CustomEvent<UploadMapProgressEventDetail> {
  constructor(data: UploadMapProgressEventDetail) {
    super("progress", { detail: data });
  }
}

export interface MapUploaderService {
  addEventListener(
    event: "start",
    callback: (data: UploadMapStartEvent) => void
  ): void;
  addEventListener(
    event: "complete",
    callback: (data: UploadMapCompleteEvent) => void
  ): void;
  addEventListener(
    event: "progress",
    callback: (data: UploadMapProgressEvent) => void
  ): void;

  removeEventListener(
    event: "start",
    callback: (data: UploadMapStartEvent) => void
  ): void;
  removeEventListener(
    event: "complete",
    callback: (data: UploadMapCompleteEvent) => void
  ): void;
  removeEventListener(
    event: "progress",
    callback: (data: UploadMapProgressEvent) => void
  ): void;
}

export class MapUploaderService extends EventTarget {
  private mapsApi: MapService;

  private uploadQueue: UploadMapEntry[];

  private currentUpload: UploadMapEntry;

  private abortController: AbortController;

  constructor(mapsApi: MapService) {
    super();
    this.uploadQueue = [];
    this.currentUpload = null;
    this.abortController = new AbortController();
    this.mapsApi = mapsApi;
  }

  public queueUploadMap(mapEntry: UploadMapEntry) {
    this.uploadQueue[this.uploadQueue.length] = mapEntry;

    this.startUpload();
  }

  public cleanUploadQueue() {
    this.uploadQueue = [];
  }

  public abortUpload() {
    this.abortController.abort();
  }

  public getCurrentUploadMap() {
    return this.currentUpload;
  }

  public isUploading() {
    return this.currentUpload !== null;
  }

  public getQueueLength() {
    return this.uploadQueue.length;
  }

  private startUpload() {
    if (!this.currentUpload && this.uploadQueue.length > 0) {
      this.currentUpload = this.uploadQueue.shift();

      this.dispatchEvent(
        new UploadMapStartEvent({
          entry: this.currentUpload,
          remain: this.uploadQueue.length,
        })
      );

      const { file, flags, additionalFlags } = this.currentUpload;
      this.mapsApi
        .uploadMap(
          { map: file, flags, additionalFlags },
          {
            signal: this.abortController.signal,
            onUploadProgress: (progressEvent: ProgressEvent) => {
              this.dispatchEvent(
                new UploadMapProgressEvent({
                  entry: this.currentUpload,
                  loaded: progressEvent.loaded,
                  total: progressEvent.total,
                })
              );
            },
          }
        )
        .then((map) => {
          this.dispatchEvent(
            new UploadMapCompleteEvent({
              map,
              error: null,
              remain: this.uploadQueue.length,
            })
          );
        })
        .catch((error) => {
          this.dispatchEvent(
            new UploadMapCompleteEvent({
              map: null,
              error,
              remain: this.uploadQueue.length,
            })
          );
        })
        .finally(() => {
          this.currentUpload = null;
          this.startUpload();
        });
    }
  }
}
