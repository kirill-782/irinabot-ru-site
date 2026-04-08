const MAP_DOWNLOAD_DB_NAME = "map-downloads";
const MAP_DOWNLOAD_DB_VERSION = 1;
const MAP_DOWNLOAD_STORE_NAME = "downloads";
const MAP_DOWNLOAD_CHUNK_STORE_NAME = "downloadChunks";
const MAP_DOWNLOAD_CHUNK_INDEX_NAME = "downloadId";
const MAP_DOWNLOAD_CHUNK_SIZE = 4 * 1024 * 1024;
const MAP_DOWNLOAD_PARALLEL_THREADS = 4;

interface PersistedDownloadRecord {
    id: string;
    url: string;
    mapId?: number;
    fileName: string;
    totalSize: number | null;
    downloadedSize: number;
    nextChunkIndex: number;
    contentType?: string;
    updatedAt: number;
}

interface PersistedDownloadChunkRecord {
    downloadId: string;
    index: number;
    data: ArrayBuffer;
}

interface DownloadChunkResponse {
    chunkIndex: number;
    status: number;
    total: number;
    contentType: string;
    data?: ArrayBuffer;
}

class PausedDownloadError extends Error {
    constructor() {
        super("Download paused");
        this.name = "PausedDownloadError";
    }
}

export interface DownloadMapEntry {
    downloadUrl: string;
    fileName: string;
    fileSize?: number;
    id: number;
}

export interface DownloadMapQueueEventDetail {
    entry: DownloadMapEntry;
    remain: number;
}

export interface DownloadMapStartEventDetail {
    entry: DownloadMapEntry;
    loaded: number;
    total: number;
    remain: number;
}

export interface DownloadMapCompleteEventDetail {
    entry: DownloadMapEntry;
    error: any;
    remain: number;
}

export interface DownloadMapProgressEventDetail {
    entry: DownloadMapEntry;
    loaded: number;
    total: number;
}

export interface DownloadMapPauseEventDetail {
    entry: DownloadMapEntry;
    loaded: number;
    total: number;
    remain: number;
}

export interface DownloadProgressSnapshot {
    loaded: number;
    total: number;
}

export type IncompleteDownloadState = "downloading" | "paused" | "queued";

export interface IncompleteMapDownload {
    id?: number;
    downloadUrl: string;
    fileName: string;
    totalSize: number;
    downloadedSize: number;
    progress: number;
    updatedAt: number;
    status: IncompleteDownloadState;
}

export class DownloadMapQueueEvent extends CustomEvent<DownloadMapQueueEventDetail> {
    constructor(data: DownloadMapQueueEventDetail) {
        super("queue", { detail: data });
    }
}

export class DownloadMapStartEvent extends CustomEvent<DownloadMapStartEventDetail> {
    constructor(data: DownloadMapStartEventDetail) {
        super("start", { detail: data });
    }
}

export class DownloadMapCompleteEvent extends CustomEvent<DownloadMapCompleteEventDetail> {
    constructor(data: DownloadMapCompleteEventDetail) {
        super("complete", { detail: data });
    }
}

export class DownloadMapProgressEvent extends CustomEvent<DownloadMapProgressEventDetail> {
    constructor(data: DownloadMapProgressEventDetail) {
        super("progress", { detail: data });
    }
}

export class DownloadMapPauseEvent extends CustomEvent<DownloadMapPauseEventDetail> {
    constructor(data: DownloadMapPauseEventDetail) {
        super("pause", { detail: data });
    }
}

export interface MapDownloaderService {
    addEventListener(event: "queue", callback: (data: DownloadMapQueueEvent) => void): void;
    addEventListener(event: "start", callback: (data: DownloadMapStartEvent) => void): void;
    addEventListener(event: "complete", callback: (data: DownloadMapCompleteEvent) => void): void;
    addEventListener(event: "progress", callback: (data: DownloadMapProgressEvent) => void): void;
    addEventListener(event: "pause", callback: (data: DownloadMapPauseEvent) => void): void;

    removeEventListener(event: "queue", callback: (data: DownloadMapQueueEvent) => void): void;
    removeEventListener(event: "start", callback: (data: DownloadMapStartEvent) => void): void;
    removeEventListener(event: "complete", callback: (data: DownloadMapCompleteEvent) => void): void;
    removeEventListener(event: "progress", callback: (data: DownloadMapProgressEvent) => void): void;
    removeEventListener(event: "pause", callback: (data: DownloadMapPauseEvent) => void): void;
}

class MapDownloadStorage {
    private dbPromise: Promise<IDBDatabase>;

    constructor() {
        this.dbPromise = this.openDb();
    }

    public async getDownload(downloadId: string) {
        const db = await this.dbPromise;

        return new Promise<PersistedDownloadRecord | null>((resolve, reject) => {
            const transaction = db.transaction(MAP_DOWNLOAD_STORE_NAME, "readonly");
            const store = transaction.objectStore(MAP_DOWNLOAD_STORE_NAME);
            const request = store.get(downloadId);

            request.onsuccess = () => {
                resolve((request.result as PersistedDownloadRecord) || null);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    public async putDownload(record: PersistedDownloadRecord) {
        const db = await this.dbPromise;

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(MAP_DOWNLOAD_STORE_NAME, "readwrite");
            const store = transaction.objectStore(MAP_DOWNLOAD_STORE_NAME);

            store.put(record);

            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };

            transaction.onabort = () => {
                reject(transaction.error);
            };
        });
    }

    public async getDownloads() {
        const db = await this.dbPromise;

        return new Promise<PersistedDownloadRecord[]>((resolve, reject) => {
            const transaction = db.transaction(MAP_DOWNLOAD_STORE_NAME, "readonly");
            const store = transaction.objectStore(MAP_DOWNLOAD_STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve((request.result as PersistedDownloadRecord[]) || []);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    public async appendChunk(record: PersistedDownloadRecord, chunk: PersistedDownloadChunkRecord) {
        const db = await this.dbPromise;

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([MAP_DOWNLOAD_STORE_NAME, MAP_DOWNLOAD_CHUNK_STORE_NAME], "readwrite");

            transaction.objectStore(MAP_DOWNLOAD_STORE_NAME).put(record);
            transaction.objectStore(MAP_DOWNLOAD_CHUNK_STORE_NAME).put(chunk);

            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };

            transaction.onabort = () => {
                reject(transaction.error);
            };
        });
    }

    public async getChunks(downloadId: string) {
        const db = await this.dbPromise;

        return new Promise<ArrayBuffer[]>((resolve, reject) => {
            const transaction = db.transaction(MAP_DOWNLOAD_CHUNK_STORE_NAME, "readonly");
            const store = transaction.objectStore(MAP_DOWNLOAD_CHUNK_STORE_NAME).index(MAP_DOWNLOAD_CHUNK_INDEX_NAME);
            const request = store.openCursor(IDBKeyRange.only(downloadId));
            const result: ArrayBuffer[] = [];

            request.onsuccess = () => {
                const cursor = request.result;

                if (!cursor) {
                    resolve(result);
                    return;
                }

                const chunk = cursor.value as PersistedDownloadChunkRecord;
                result.push(chunk.data);
                cursor.continue();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    public async getChunkIndexes(downloadId: string) {
        const db = await this.dbPromise;

        return new Promise<number[]>((resolve, reject) => {
            const transaction = db.transaction(MAP_DOWNLOAD_CHUNK_STORE_NAME, "readonly");
            const store = transaction.objectStore(MAP_DOWNLOAD_CHUNK_STORE_NAME).index(MAP_DOWNLOAD_CHUNK_INDEX_NAME);
            const request = store.openCursor(IDBKeyRange.only(downloadId));
            const result: number[] = [];

            request.onsuccess = () => {
                const cursor = request.result;

                if (!cursor) {
                    resolve(result);
                    return;
                }

                const chunk = cursor.value as PersistedDownloadChunkRecord;
                result.push(chunk.index);
                cursor.continue();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    public async deleteDownload(downloadId: string) {
        const db = await this.dbPromise;

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([MAP_DOWNLOAD_STORE_NAME, MAP_DOWNLOAD_CHUNK_STORE_NAME], "readwrite");
            const downloadStore = transaction.objectStore(MAP_DOWNLOAD_STORE_NAME);
            const chunkStore = transaction.objectStore(MAP_DOWNLOAD_CHUNK_STORE_NAME).index(MAP_DOWNLOAD_CHUNK_INDEX_NAME);
            const request = chunkStore.openCursor(IDBKeyRange.only(downloadId));

            request.onsuccess = () => {
                const cursor = request.result;

                if (!cursor) {
                    downloadStore.delete(downloadId);
                    return;
                }

                cursor.delete();
                cursor.continue();
            };

            request.onerror = () => {
                reject(request.error);
            };

            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };

            transaction.onabort = () => {
                reject(transaction.error);
            };
        });
    }

    private openDb() {
        return new Promise<IDBDatabase>((resolve, reject) => {
            const request = window.indexedDB.open(MAP_DOWNLOAD_DB_NAME, MAP_DOWNLOAD_DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains(MAP_DOWNLOAD_STORE_NAME)) {
                    db.createObjectStore(MAP_DOWNLOAD_STORE_NAME, { keyPath: "id" });
                }

                if (!db.objectStoreNames.contains(MAP_DOWNLOAD_CHUNK_STORE_NAME)) {
                    const chunkStore = db.createObjectStore(MAP_DOWNLOAD_CHUNK_STORE_NAME, {
                        keyPath: ["downloadId", "index"],
                    });

                    chunkStore.createIndex(MAP_DOWNLOAD_CHUNK_INDEX_NAME, "downloadId", { unique: false });
                }
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

export class MapDownloaderService extends EventTarget {
    private storage: MapDownloadStorage;

    private downloadQueue: DownloadMapEntry[];

    private currentDownload: DownloadMapEntry;

    private abortController: AbortController;

    private currentProgress: DownloadProgressSnapshot;

    private currentPaused: boolean;

    private writeQueue: Promise<void>;

    constructor() {
        super();
        this.storage = new MapDownloadStorage();
        this.downloadQueue = [];
        this.currentDownload = null;
        this.abortController = null;
        this.currentProgress = null;
        this.currentPaused = false;
        this.writeQueue = Promise.resolve();
    }

    public queueDownloadMap(mapEntry: DownloadMapEntry) {
        if (this.isSameEntry(this.currentDownload, mapEntry) || this.isQueued(mapEntry.downloadUrl, mapEntry.id)) {
            return false;
        }

        this.downloadQueue[this.downloadQueue.length] = mapEntry;

        this.dispatchEvent(
            new DownloadMapQueueEvent({
                entry: mapEntry,
                remain: this.downloadQueue.length,
            })
        );

        this.startDownload();

        return true;
    }

    public cleanDownloadQueue() {
        this.downloadQueue = [];
    }

    public abortDownload() {
        if (!this.currentDownload || !this.abortController) return false;

        this.currentPaused = false;
        this.abortController.abort();

        return true;
    }

    public pauseDownload(downloadUrl?: string, id?: number) {
        if (!this.matchesCurrent(downloadUrl, id) || this.currentPaused || !this.abortController) {
            return false;
        }

        this.currentPaused = true;
        this.abortController.abort();

        return true;
    }

    public resumeDownload(downloadUrl?: string, id?: number) {
        if (!this.matchesCurrent(downloadUrl, id) || !this.currentPaused || this.abortController) {
            return false;
        }

        this.currentPaused = false;
        this.runCurrentDownload();

        return true;
    }

    public getCurrentDownloadMap() {
        return this.currentDownload;
    }

    public getCurrentDownloadProgress() {
        return this.currentProgress;
    }

    public async getIncompleteDownloads() {
        const downloads = await this.storage.getDownloads();

        return downloads
            .filter((download) => {
                return !download.totalSize || download.downloadedSize < download.totalSize;
            })
            .map((download) => {
                const totalSize = download.totalSize || download.downloadedSize || 0;

                return {
                    id: download.mapId,
                    downloadUrl: download.url,
                    fileName: download.fileName,
                    totalSize,
                    downloadedSize: download.downloadedSize,
                    progress: this.getProgressPercent(download.downloadedSize, totalSize),
                    updatedAt: download.updatedAt,
                    status: this.getIncompleteDownloadState(download.url, download.mapId),
                };
            })
            .sort((first, second) => {
                const statusOrder = this.getIncompleteDownloadStateOrder(first.status) - this.getIncompleteDownloadStateOrder(second.status);

                if (statusOrder !== 0) {
                    return statusOrder;
                }

                return second.updatedAt - first.updatedAt;
            });
    }

    public isDownloading() {
        return this.currentDownload !== null && !this.currentPaused;
    }

    public isPaused(downloadUrl?: string, id?: number) {
        if (!this.currentPaused || !this.currentDownload) return false;

        return this.matchesCurrent(downloadUrl, id);
    }

    public getQueueLength() {
        return this.downloadQueue.length;
    }

    public isQueued(downloadUrl: string, id?: number) {
        return this.downloadQueue.some((entry) => {
            if (id !== undefined && entry.id !== id) return false;

            return this.getStorageKey(entry.downloadUrl) === this.getStorageKey(downloadUrl);
        });
    }

    private startDownload() {
        if (this.currentDownload || this.downloadQueue.length === 0) return;

        this.currentDownload = this.downloadQueue.shift()!;
        this.currentPaused = false;
        this.runCurrentDownload();
    }

    private runCurrentDownload() {
        const entry = this.currentDownload;

        if (!entry) return;

        const abortController = new AbortController();
        this.abortController = abortController;
        this.writeQueue = Promise.resolve();

        void this.executeCurrentDownload(entry, abortController);
    }

    private async executeCurrentDownload(entry: DownloadMapEntry, abortController: AbortController) {
        let paused = false;
        let error = null;

        try {
            await this.downloadEntry(entry, abortController.signal);
        } catch (downloadError) {
            if (downloadError instanceof PausedDownloadError) {
                paused = true;
            } else {
                error = downloadError;
            }
        }

        try {
            await this.writeQueue;
        } catch (writeError) {
            if (!paused && !error) {
                error = writeError;
            }
        }

        if (this.abortController === abortController) {
            this.abortController = null;
        }

        if (paused) {
            this.dispatchEvent(
                new DownloadMapPauseEvent({
                    entry,
                    loaded: this.currentProgress?.loaded || 0,
                    total: this.currentProgress?.total || 0,
                    remain: this.downloadQueue.length,
                })
            );
            return;
        }

        this.dispatchEvent(
            new DownloadMapCompleteEvent({
                entry,
                error,
                remain: this.downloadQueue.length,
            })
        );

        if (this.currentDownload === entry) {
            this.currentDownload = null;
            this.currentProgress = null;
            this.currentPaused = false;
        }

        this.startDownload();
    }

    private async downloadEntry(entry: DownloadMapEntry, signal: AbortSignal) {
        const downloadId = this.getStorageKey(entry.downloadUrl);
        let storedDownload = await this.storage.getDownload(downloadId);

        if (this.isStoredDownloadInvalid(entry, storedDownload)) {
            await this.storage.deleteDownload(downloadId);
            storedDownload = null;
        }

        const total = storedDownload?.totalSize ?? entry.fileSize ?? 0;
        const loaded = storedDownload?.downloadedSize ?? 0;

        this.currentProgress = {
            loaded,
            total,
        };

        this.dispatchEvent(
            new DownloadMapStartEvent({
                entry,
                loaded,
                total,
                remain: this.downloadQueue.length,
            })
        );

        if (storedDownload?.totalSize && storedDownload.downloadedSize >= storedDownload.totalSize) {
            await this.finalizeDownload(entry, storedDownload);
            return;
        }

        try {
            const record = await this.downloadResponse(entry, storedDownload, signal, false);
            await this.finalizeDownload(entry, record);
        } catch (error) {
            if (signal.aborted && this.currentPaused && this.isSameEntry(this.currentDownload, entry)) {
                throw new PausedDownloadError();
            }

            throw error;
        }
    }

    private async downloadResponse(
        entry: DownloadMapEntry,
        storedDownload: PersistedDownloadRecord,
        signal: AbortSignal,
        restarted: boolean
    ) {
        const downloadId = this.getStorageKey(entry.downloadUrl);
        const resolvedUrl = this.getStorageKey(entry.downloadUrl);
        const completedChunkIndexes = new Set(await this.storage.getChunkIndexes(downloadId));

        let record: PersistedDownloadRecord = {
            id: downloadId,
            url: resolvedUrl,
            mapId: storedDownload?.mapId ?? entry.id,
            fileName: entry.fileName,
            totalSize: storedDownload?.totalSize || entry.fileSize || null,
            downloadedSize: storedDownload?.downloadedSize || 0,
            nextChunkIndex: storedDownload?.nextChunkIndex || 0,
            contentType: storedDownload?.contentType || "application/octet-stream",
            updatedAt: Date.now(),
        };

        await this.storage.putDownload(record);

        const persistChunk = async (response: DownloadChunkResponse) => {
            this.writeQueue = this.writeQueue.then(async () => {
                if (!response.data || completedChunkIndexes.has(response.chunkIndex)) return;

                record = {
                    ...record,
                    downloadedSize: record.downloadedSize + response.data.byteLength,
                    nextChunkIndex: Math.max(record.nextChunkIndex, response.chunkIndex),
                    totalSize: response.total || record.totalSize,
                    contentType: response.contentType || record.contentType,
                    updatedAt: Date.now(),
                };

                await this.storage.appendChunk(record, {
                    downloadId,
                    index: response.chunkIndex,
                    data: response.data,
                });

                completedChunkIndexes.add(response.chunkIndex);
                this.emitProgress(entry, record.downloadedSize, record.totalSize || record.downloadedSize);
            });

            await this.writeQueue;
        };

        const totalChunksHint = record.totalSize ? this.getTotalChunkCount(record.totalSize) : undefined;
        const probeChunkIndex = this.getFirstMissingChunkIndex(completedChunkIndexes, totalChunksHint) || 1;
        const probeResponse = await this.fetchChunk(resolvedUrl, probeChunkIndex, record.totalSize, signal);

        if (probeResponse.status === 416) {
            const completedTotal = probeResponse.total || record.totalSize;

            if (completedTotal && record.downloadedSize >= completedTotal) {
                return {
                    ...record,
                    totalSize: completedTotal,
                };
            }

            await this.storage.deleteDownload(downloadId);

            if (restarted) {
                throw new Error("Stored download state is invalid");
            }

            this.emitProgress(entry, 0, entry.fileSize || 0);

            return this.downloadResponse(entry, null, signal, true);
        }

        if (probeResponse.status === 200 && (probeChunkIndex !== 1 || completedChunkIndexes.size > 0)) {
            await this.storage.deleteDownload(downloadId);

            if (restarted) {
                throw new Error("Server does not support resumable downloads for this file");
            }

            this.emitProgress(entry, 0, entry.fileSize || 0);

            return this.downloadResponse(entry, null, signal, true);
        }

        if (probeResponse.data) {
            await persistChunk(probeResponse);
        }

        if (probeResponse.status === 200) {
            return {
                ...record,
                totalSize: probeResponse.total || record.totalSize || probeResponse.data?.byteLength || record.downloadedSize,
            };
        }

        const totalSize = probeResponse.total || record.totalSize || entry.fileSize || 0;
        const totalChunkCount = this.getTotalChunkCount(totalSize);
        let nextChunkIndex = 1;

        const takeNextChunkIndex = () => {
            while (nextChunkIndex <= totalChunkCount) {
                const candidate = nextChunkIndex;
                nextChunkIndex += 1;

                if (!completedChunkIndexes.has(candidate)) {
                    return candidate;
                }
            }

            return null;
        };

        const worker = async () => {
            while (true) {
                const chunkIndex = takeNextChunkIndex();

                if (chunkIndex === null) {
                    return;
                }

                const response = await this.fetchChunk(resolvedUrl, chunkIndex, totalSize, signal);

                if (response.status === 416) {
                    return;
                }

                if (response.status === 200) {
                    throw new Error("Server returned a non-ranged response during parallel download");
                }

                await persistChunk(response);
            }
        };

        const remainingChunkCount = Math.max(0, totalChunkCount - completedChunkIndexes.size);
        const workerCount = Math.min(MAP_DOWNLOAD_PARALLEL_THREADS, remainingChunkCount);

        await Promise.all(
            Array.from({ length: workerCount }).map(() => {
                return worker();
            })
        );

        return {
            ...record,
            totalSize: totalSize || record.totalSize || record.downloadedSize,
        };
    }

    private async finalizeDownload(entry: DownloadMapEntry, record: PersistedDownloadRecord) {
        const chunks = await this.storage.getChunks(record.id);
        const blob = new Blob(chunks, {
            type: record.contentType || "application/octet-stream",
        });

        this.saveBlob(blob, entry.fileName || record.fileName);
        await this.storage.deleteDownload(record.id);

        this.currentProgress = {
            loaded: record.totalSize || blob.size,
            total: record.totalSize || blob.size,
        };
    }

    private async fetchChunk(url: string, chunkIndex: number, totalSize: number, signal: AbortSignal) {
        const chunkStart = (chunkIndex - 1) * MAP_DOWNLOAD_CHUNK_SIZE;
        const chunkEnd =
            totalSize && totalSize > 0
                ? Math.min(chunkStart + MAP_DOWNLOAD_CHUNK_SIZE - 1, totalSize - 1)
                : chunkStart + MAP_DOWNLOAD_CHUNK_SIZE - 1;

        const response = await fetch(url, {
            headers: this.getRequestHeaders(chunkStart, chunkEnd),
            method: "GET",
            signal,
        });

        const resolvedTotal = this.getDownloadTotal(response, chunkStart, totalSize);
        const contentType = response.headers.get("content-type") || "application/octet-stream";

        if (response.status === 416) {
            return {
                chunkIndex,
                status: response.status,
                total: resolvedTotal,
                contentType,
            };
        }

        if (!response.ok) {
            throw new Error(`Download failed with status ${response.status}`);
        }

        const data = await response.arrayBuffer();

        return {
            chunkIndex,
            status: response.status,
            total: resolvedTotal || data.byteLength,
            contentType,
            data,
        };
    }

    private saveBlob(blob: Blob, fileName: string) {
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = objectUrl;
        link.download = fileName;
        link.rel = "noopener";
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.setTimeout(() => {
            window.URL.revokeObjectURL(objectUrl);
        }, 1000);
    }

    private emitProgress(entry: DownloadMapEntry, loaded: number, total: number) {
        this.currentProgress = {
            loaded,
            total,
        };

        this.dispatchEvent(
            new DownloadMapProgressEvent({
                entry,
                loaded,
                total,
            })
        );
    }

    private getRequestHeaders(offset: number, end?: number) {
        const headers = new Headers();
        headers.set("Range", `bytes=${offset}-${end !== undefined ? end : ""}`);

        return headers;
    }

    private getDownloadTotal(response: Response, _offset: number, fallback?: number) {
        const rangeTotal = this.getRangeTotal(response.headers.get("content-range"));

        if (rangeTotal) return rangeTotal;

        if (fallback && fallback > 0) {
            return fallback;
        }

        const contentLength = this.getHeaderNumber(response.headers.get("content-length"));

        if (response.status === 206 && contentLength) {
            return 0;
        }

        return contentLength || 0;
    }

    private getHeaderNumber(value: string) {
        if (!value) return 0;

        const parsed = Number(value);

        if (!Number.isFinite(parsed)) return 0;

        return parsed;
    }

    private getRangeTotal(value: string) {
        if (!value) return 0;

        const total = value.split("/")[1];

        if (!total || total === "*") return 0;

        const parsed = Number(total);

        if (!Number.isFinite(parsed)) return 0;

        return parsed;
    }

    private getTotalChunkCount(totalSize: number) {
        if (!totalSize || totalSize <= 0) return 0;

        return Math.ceil(totalSize / MAP_DOWNLOAD_CHUNK_SIZE);
    }

    private getProgressPercent(loaded: number, total: number) {
        if (!total || total <= 0) return 0;

        return Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
    }

    private isStoredDownloadInvalid(entry: DownloadMapEntry, storedDownload: PersistedDownloadRecord) {
        if (!storedDownload) return false;

        if (storedDownload.totalSize && storedDownload.downloadedSize > storedDownload.totalSize) {
            return true;
        }

        if (entry.fileSize && storedDownload.totalSize && storedDownload.totalSize < entry.fileSize) {
            return true;
        }

        return false;
    }

    private getIncompleteDownloadState(downloadUrl: string, id?: number): IncompleteDownloadState {
        if (this.matchesCurrent(downloadUrl, id)) {
            return this.currentPaused ? "paused" : "downloading";
        }

        if (this.isQueued(downloadUrl, id)) {
            return "queued";
        }

        return "paused";
    }

    private getIncompleteDownloadStateOrder(status: IncompleteDownloadState) {
        if (status === "downloading") return 0;
        if (status === "queued") return 1;

        return 2;
    }

    private getFirstMissingChunkIndex(completedChunkIndexes: Set<number>, totalChunkCount?: number) {
        const limit = totalChunkCount || Number.MAX_SAFE_INTEGER;

        for (let chunkIndex = 1; chunkIndex <= limit; chunkIndex += 1) {
            if (!completedChunkIndexes.has(chunkIndex)) {
                return chunkIndex;
            }
        }

        return null;
    }

    private getStorageKey(downloadUrl: string) {
        return downloadUrl;
    }

    private matchesCurrent(downloadUrl?: string, id?: number) {
        if (!this.currentDownload) return false;

        if (id !== undefined && this.currentDownload.id !== id) return false;

        if (downloadUrl && this.getStorageKey(this.currentDownload.downloadUrl) !== this.getStorageKey(downloadUrl)) {
            return false;
        }

        return true;
    }

    private isSameEntry(first: DownloadMapEntry, second: DownloadMapEntry) {
        if (!first || !second) return false;

        return first.id === second.id && this.getStorageKey(first.downloadUrl) === this.getStorageKey(second.downloadUrl);
    }
}
