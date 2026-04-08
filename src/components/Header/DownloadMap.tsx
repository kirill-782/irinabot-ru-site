import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { Icon, Menu } from "semantic-ui-react";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import ProgressDownloadMapModal from "../Modal/ProgressDownloadMapModal";
import {
    DownloadMapCompleteEvent,
    DownloadMapPauseEvent,
    DownloadMapProgressEvent,
    DownloadMapQueueEvent,
    DownloadMapStartEvent,
    IncompleteMapDownload,
} from "../../services/MapDownloaderService";

interface CurrentMapDownloadDescription {
    id?: number;
    downloadUrl: string;
    fileName: string;
    totalSize: number;
    loadedSize: number;
}

function DownloadMap() {
    const { mapDownloader } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const t = language.getString;

    const [modalOpen, setModalOpen] = useState(false);
    const [isMapDownloading, setMapDownloading] = useState(mapDownloader.isDownloading());
    const [currentDownload, setCurrentDownload] = useState<CurrentMapDownloadDescription>(null);
    const [incompleteDownloads, setIncompleteDownloads] = useState<IncompleteMapDownload[]>([]);

    useEffect(() => {
        let mounted = true;

        const syncCurrentDownload = () => {
            const activeDownload = mapDownloader.getCurrentDownloadMap();
            const progress = mapDownloader.getCurrentDownloadProgress();

            setMapDownloading(mapDownloader.isDownloading());

            if (!activeDownload || !progress || !mapDownloader.isDownloading()) {
                setCurrentDownload(null);
                return;
            }

            setCurrentDownload({
                id: activeDownload.id,
                downloadUrl: activeDownload.downloadUrl,
                fileName: activeDownload.fileName,
                totalSize: progress.total,
                loadedSize: progress.loaded,
            });
        };

        const refreshDownloads = async () => {
            const downloads = await mapDownloader.getIncompleteDownloads();

            if (!mounted) return;

            setIncompleteDownloads(downloads);
        };

        const mergeDownload = (
            entry: { id: number; downloadUrl: string; fileName: string },
            loaded: number,
            total: number,
            status: IncompleteMapDownload["status"]
        ) => {
            setIncompleteDownloads((currentDownloads) => {
                const nextDownloads = currentDownloads.filter((download) => !isSameDownload(download, entry));

                nextDownloads.unshift({
                    id: entry.id,
                    downloadUrl: entry.downloadUrl,
                    fileName: entry.fileName,
                    totalSize: total || loaded || 0,
                    downloadedSize: loaded,
                    progress: getProgressPercent(loaded, total || loaded || 0),
                    updatedAt: Date.now(),
                    status,
                });

                return sortDownloads(nextDownloads);
            });
        };

        const markQueued = (entry: { id: number; downloadUrl: string }) => {
            setIncompleteDownloads((currentDownloads) => {
                return sortDownloads(
                    currentDownloads.map((download) => {
                        if (!isSameDownload(download, entry)) return download;

                        return {
                            ...download,
                            status: "queued",
                        };
                    })
                );
            });
        };

        const onQueue = (event: DownloadMapQueueEvent) => {
            markQueued(event.detail.entry);
        };

        const onStart = (event: DownloadMapStartEvent) => {
            setMapDownloading(true);
            setCurrentDownload({
                id: event.detail.entry.id,
                downloadUrl: event.detail.entry.downloadUrl,
                fileName: event.detail.entry.fileName,
                totalSize: event.detail.total,
                loadedSize: event.detail.loaded,
            });
            mergeDownload(event.detail.entry, event.detail.loaded, event.detail.total, "downloading");
        };

        const onProgress = (event: DownloadMapProgressEvent) => {
            setMapDownloading(true);
            setCurrentDownload({
                id: event.detail.entry.id,
                downloadUrl: event.detail.entry.downloadUrl,
                fileName: event.detail.entry.fileName,
                totalSize: event.detail.total,
                loadedSize: event.detail.loaded,
            });
            mergeDownload(event.detail.entry, event.detail.loaded, event.detail.total, "downloading");
        };

        const onPause = (event: DownloadMapPauseEvent) => {
            setMapDownloading(false);
            setCurrentDownload(null);
            mergeDownload(event.detail.entry, event.detail.loaded, event.detail.total, "paused");
            void refreshDownloads();
        };

        const onComplete = (event: DownloadMapCompleteEvent) => {
            setMapDownloading(mapDownloader.isDownloading());
            setCurrentDownload(null);
            void refreshDownloads();
        };

        syncCurrentDownload();
        void refreshDownloads();

        mapDownloader.addEventListener("queue", onQueue);
        mapDownloader.addEventListener("start", onStart);
        mapDownloader.addEventListener("progress", onProgress);
        mapDownloader.addEventListener("pause", onPause);
        mapDownloader.addEventListener("complete", onComplete);

        return () => {
            mounted = false;
            mapDownloader.removeEventListener("queue", onQueue);
            mapDownloader.removeEventListener("start", onStart);
            mapDownloader.removeEventListener("progress", onProgress);
            mapDownloader.removeEventListener("pause", onPause);
            mapDownloader.removeEventListener("complete", onComplete);
        };
    }, [mapDownloader]);

    const onItemClick = () => {
        setModalOpen(true);
    };

    const onModalClose = (_event?: SyntheticEvent, _data?: object) => {
        setModalOpen(false);
    };

    const onPauseDownload = (download: IncompleteMapDownload) => {
        mapDownloader.pauseDownload(download.downloadUrl, download.id);
    };

    const onResumeDownload = (download: IncompleteMapDownload) => {
        if (mapDownloader.isPaused(download.downloadUrl, download.id)) {
            mapDownloader.resumeDownload(download.downloadUrl, download.id);
            return;
        }

        mapDownloader.queueDownloadMap({
            downloadUrl: download.downloadUrl,
            fileName: download.fileName,
            fileSize: download.totalSize || undefined,
            id: download.id || 0,
        });
    };

    const hint = getMenuHint({
        currentDownload,
        incompleteCount: incompleteDownloads.length,
        lang,
        t,
    });

    return (
        <>
            <div
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                {modalOpen && (
                    <ProgressDownloadMapModal
                        open={modalOpen}
                        downloads={incompleteDownloads}
                        currentDownload={currentDownload}
                        onClose={onModalClose}
                        onPause={onPauseDownload}
                        onResume={onResumeDownload}
                    />
                )}
            </div>
            <Menu.Item onClick={onItemClick} title={hint}>
                <Icon color={isMapDownloading ? "green" : incompleteDownloads.length > 0 ? "yellow" : undefined} name="download" />
                {lang.mapDownloadManage}
            </Menu.Item>
        </>
    );
}

function getProgressPercent(loaded: number, total: number) {
    if (!total || total <= 0) return 0;

    return Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
}

function getMenuHint({
    currentDownload,
    incompleteCount,
    lang,
    t,
}: {
    currentDownload: CurrentMapDownloadDescription;
    incompleteCount: number;
    lang: {
        mapDownloadNoActiveHint: string;
    };
    t: (stringId: "mapDownloadActiveHint" | "mapDownloadIncompleteHint", values?: Record<string, string | number | boolean>) => string;
}) {
    if (currentDownload) {
        return t("mapDownloadActiveHint", {
            filename: currentDownload.fileName,
            percent: getProgressPercent(currentDownload.loadedSize, currentDownload.totalSize),
        });
    }

    if (incompleteCount > 0) {
        return t("mapDownloadIncompleteHint", { count: incompleteCount });
    }

    return lang.mapDownloadNoActiveHint;
}

function isSameDownload(
    first: { id?: number; downloadUrl: string },
    second: { id?: number; downloadUrl: string }
) {
    if (first.id !== undefined && second.id !== undefined && first.id !== second.id) {
        return false;
    }

    return first.downloadUrl === second.downloadUrl;
}

function sortDownloads(downloads: IncompleteMapDownload[]) {
    return [...downloads].sort((first, second) => {
        const statusOrder = getStatusOrder(first.status) - getStatusOrder(second.status);

        if (statusOrder !== 0) {
            return statusOrder;
        }

        return second.updatedAt - first.updatedAt;
    });
}

function getStatusOrder(status: IncompleteMapDownload["status"]) {
    if (status === "downloading") return 0;
    if (status === "queued") return 1;

    return 2;
}

export default DownloadMap;
