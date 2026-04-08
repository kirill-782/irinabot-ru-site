import React, { MouseEvent, useContext, useEffect, useState } from "react";
import { Button, ButtonProps, Icon } from "semantic-ui-react";

import { toast } from "@kokomi/react-semantic-toasts";
import byteSize from "byte-size";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { LanguageRepository } from "../../localization/Lang";
import {
    DownloadMapCompleteEvent,
    DownloadMapPauseEvent,
    DownloadMapProgressEvent,
    DownloadMapQueueEvent,
    DownloadMapStartEvent,
} from "../../services/MapDownloaderService";
import { getBotFileName } from "../../utils/MapFileUtils";
import LanguageKey from "./../LanguageKey";
import "./MapDownloadButton.scss";

interface MapDownloadButtonProps {
    downloadUrl: string;
    fileName?: string;
    fileSize?: number;
    className?: string;
    id: number;
}

type DownloadButtonState = "idle" | "queued" | "downloading" | "paused";

type DownloadButtonLang = Pick<LanguageRepository, "mapDownloadQueued">;
type DownloadButtonTranslate = (
    stringId: "mapDownloadPause" | "mapDownloadResume",
    values?: Record<string, string | number | boolean>
) => string;

function MapDownloadButton({ downloadUrl, fileName, fileSize, className, id }: MapDownloadButtonProps) {
    const { mapDownloader } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const t = language.getString;
    const mapSize = byteSize(fileSize || 0);
    const downloadFileName = getBotFileName(fileName || "", id);
    const downloadHref = getDownloadHref(downloadUrl, downloadFileName);

    const isCurrentDownload = mapDownloader.getCurrentDownloadMap()?.id === id;
    const currentProgress = mapDownloader.getCurrentDownloadProgress();

    const [downloadState, setDownloadState] = useState<DownloadButtonState>(() => {
        if (mapDownloader.isPaused(downloadUrl, id)) return "paused";
        if (isCurrentDownload) return "downloading";
        if (mapDownloader.isQueued(downloadUrl, id)) return "queued";

        return "idle";
    });
    const [progress, setProgress] = useState(() => {
        if (!isCurrentDownload || !currentProgress) return 0;

        return getProgressPercent(currentProgress.loaded, currentProgress.total || fileSize || 0);
    });
    const isBusy = downloadState !== "idle";

    useEffect(() => {
        const isButtonEvent = (entry: { id: number; downloadUrl: string }) => {
            return entry.id === id && entry.downloadUrl === downloadUrl;
        };

        const onQueue = (event: DownloadMapQueueEvent) => {
            if (!isButtonEvent(event.detail.entry)) return;

            setDownloadState("queued");
            setProgress(0);
        };

        const onStart = (event: DownloadMapStartEvent) => {
            if (!isButtonEvent(event.detail.entry)) return;

            setDownloadState("downloading");
            setProgress(getProgressPercent(event.detail.loaded, event.detail.total || fileSize || 0));
        };

        const onProgress = (event: DownloadMapProgressEvent) => {
            if (!isButtonEvent(event.detail.entry)) return;

            setDownloadState("downloading");
            setProgress(getProgressPercent(event.detail.loaded, event.detail.total || fileSize || 0));
        };

        const onPause = (event: DownloadMapPauseEvent) => {
            if (!isButtonEvent(event.detail.entry)) return;

            setDownloadState("paused");
            setProgress(getProgressPercent(event.detail.loaded, event.detail.total || fileSize || 0));
        };

        const onComplete = (event: DownloadMapCompleteEvent) => {
            if (!isButtonEvent(event.detail.entry)) return;

            setDownloadState("idle");
            setProgress(0);

            if (event.detail.error && event.detail.error?.name !== "AbortError") {
                toast({
                    title: lang.mapDownloadError,
                    description: event.detail.error.toString(),
                    type: "error",
                });
            }
        };

        mapDownloader.addEventListener("queue", onQueue);
        mapDownloader.addEventListener("start", onStart);
        mapDownloader.addEventListener("progress", onProgress);
        mapDownloader.addEventListener("pause", onPause);
        mapDownloader.addEventListener("complete", onComplete);

        return () => {
            mapDownloader.removeEventListener("queue", onQueue);
            mapDownloader.removeEventListener("start", onStart);
            mapDownloader.removeEventListener("progress", onProgress);
            mapDownloader.removeEventListener("pause", onPause);
            mapDownloader.removeEventListener("complete", onComplete);
        };
    }, [downloadUrl, fileSize, id, lang.mapDownloadError, mapDownloader]);

    const onButtonClick = (event: MouseEvent<HTMLElement>, data?: ButtonProps) => {
        event.preventDefault();

        if (downloadState === "queued") return;
        if (downloadState === "downloading") {
            mapDownloader.pauseDownload(downloadUrl, id);
            return;
        }
        if (downloadState === "paused") {
            mapDownloader.resumeDownload(downloadUrl, id);
            return;
        }

        mapDownloader.queueDownloadMap({
            downloadUrl,
            fileName: downloadFileName,
            fileSize,
            id,
        });
    };

    return (
        <Button
            className={["map-download-button", isBusy ? "busy" : "", downloadState, className].filter(Boolean).join(" ")}
            floated="left"
            color={downloadState === "paused" ? "yellow" : "green"}
            as="a"
            href={downloadHref}
            onClick={onButtonClick}
            title={getButtonTitle(downloadState, progress, lang, t)}
            aria-busy={isBusy}
            style={
                {
                    "--map-download-progress": `${progress}%`,
                } as React.CSSProperties
            }
        >
            {!isBusy && <Icon name="download" />}
            {isBusy ? (
                getButtonText(downloadState, progress, lang, t)
            ) : (
                <LanguageKey stringId="mapDownloadButton" value={mapSize.value} unit={mapSize.unit} />
            )}
        </Button>
    );
}

function getProgressPercent(loaded: number, total: number) {
    if (!total || total <= 0) return 0;

    return Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
}

function getButtonText(
    state: DownloadButtonState,
    progress: number,
    lang: DownloadButtonLang,
    t: DownloadButtonTranslate
) {
    if (state === "queued") return lang.mapDownloadQueued;
    if (state === "paused") return t("mapDownloadResume", { percent: progress });

    return t("mapDownloadPause", { percent: progress });
}

function getButtonTitle(
    state: DownloadButtonState,
    progress: number,
    lang: DownloadButtonLang,
    t: DownloadButtonTranslate
) {
    if (state === "idle") return undefined;

    return getButtonText(state, progress, lang, t);
}

function getDownloadHref(downloadUrl: string, fileName: string) {
    const url = new URL(downloadUrl);

    url.searchParams.set("as", fileName);

    return url.toString();
}

export default MapDownloadButton;
