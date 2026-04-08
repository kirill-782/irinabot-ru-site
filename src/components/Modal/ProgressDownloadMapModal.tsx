import byteSize from "byte-size";
import React, { SyntheticEvent, useContext } from "react";
import { Button, List, Modal, Progress } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { AppRuntimeSettingsContext } from "../../context";
import { IncompleteMapDownload } from "../../services/MapDownloaderService";
import "./ProgressDownloadMapModal.scss";

interface CurrentMapDownloadDescription {
    id?: number;
    downloadUrl: string;
    fileName: string;
    totalSize: number;
    loadedSize: number;
}

interface DownloadMapModalProps {
    open: boolean;
    downloads: IncompleteMapDownload[];
    currentDownload: CurrentMapDownloadDescription;
    onClose: (event: SyntheticEvent, data: object) => void;
    onPause: (download: IncompleteMapDownload) => void;
    onResume: (download: IncompleteMapDownload) => void;
}

function ProgressDownloadMapModal({
    open,
    downloads,
    currentDownload,
    onClose,
    onPause,
    onResume,
}: DownloadMapModalProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    return (
        <Modal open={open} onClose={onClose} closeIcon className="progress-download-map-modal">
            <Modal.Header>{lang.mapDownloadModalHeader}</Modal.Header>
            <Modal.Content>
                <p>{lang.mapDownloadModalDescription}</p>
                {currentDownload && (
                    <Progress
                        color="green"
                        indicating
                        percent={getProgressPercent(currentDownload.loadedSize, currentDownload.totalSize)}
                        label={currentDownload.fileName}
                    />
                )}
                {downloads.length === 0 ? (
                    <p>{lang.mapDownloadModalEmpty}</p>
                ) : (
                    <List divided relaxed>
                        {downloads.map((download) => {
                            const sizeLabel = getSizeLabel(download.downloadedSize, download.totalSize);

                            return (
                                <List.Item key={`${download.downloadUrl}-${download.id || 0}`} className="progress-download-map-modal__item">
                                    <div className="progress-download-map-modal__main">
                                        <List.Header>{download.fileName}</List.Header>
                                        <List.Description>
                                            {getStatusText(download.status, lang)} {download.progress}% • {sizeLabel}
                                        </List.Description>
                                        <Progress
                                            color={getProgressColor(download.status)}
                                            percent={download.progress}
                                            size="tiny"
                                            indicating={download.status === "downloading"}
                                        />
                                    </div>
                                    <div className="progress-download-map-modal__actions">
                                        {download.status === "downloading" ? (
                                            <Button size="small" color="yellow" onClick={() => onPause(download)}>
                                                {lang.mapDownloadPauseAction}
                                            </Button>
                                        ) : download.status === "queued" ? (
                                            <Button size="small" disabled>
                                                {lang.mapDownloadQueued}
                                            </Button>
                                        ) : (
                                            <Button size="small" color="green" onClick={() => onResume(download)}>
                                                {lang.mapDownloadResumeAction}
                                            </Button>
                                        )}
                                        {download.id ? (
                                            <Button as={NavLink} size="small" to={`/maps/${download.id}`}>
                                                {lang.mapDownloadOpenMap}
                                            </Button>
                                        ) : null}
                                    </div>
                                </List.Item>
                            );
                        })}
                    </List>
                )}
            </Modal.Content>
        </Modal>
    );
}

function getProgressPercent(loaded: number, total: number) {
    if (!total || total <= 0) return 0;

    return Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
}

function getSizeLabel(loaded: number, total: number) {
    const loadedSize = byteSize(loaded || 0);
    const totalSize = byteSize(total || 0);

    return `${loadedSize.value} ${loadedSize.unit} / ${totalSize.value} ${totalSize.unit}`;
}

function getStatusText(
    status: IncompleteMapDownload["status"],
    lang: {
        mapDownloadStatusDownloading: string;
        mapDownloadStatusPaused: string;
        mapDownloadQueued: string;
    }
) {
    if (status === "downloading") return lang.mapDownloadStatusDownloading;
    if (status === "queued") return lang.mapDownloadQueued;

    return lang.mapDownloadStatusPaused;
}

function getProgressColor(status: IncompleteMapDownload["status"]) {
    if (status === "downloading") return "green";
    if (status === "queued") return "grey";

    return "yellow";
}

export default ProgressDownloadMapModal;
