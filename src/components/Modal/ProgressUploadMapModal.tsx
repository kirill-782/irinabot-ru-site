import { Grid, Modal, Progress } from "semantic-ui-react";
import { SyntheticEvent, useContext } from "react";
import React from "react";
import { AppRuntimeSettingsContext } from "../../context";
import LanguageKey from "./../LanguageKey";

interface UploadMapModalProps {
    open: boolean;
    percent: number;
    filename: string;
    onClose: (event: SyntheticEvent, data: object) => void;
}

function ProgressUploadMapModal({ open, percent, filename, onClose }: UploadMapModalProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const t = language.getString;

    return (
        <Modal open={open} onClose={onClose} closeIcon>
            <Modal.Header>{lang.progressUploadMapModalHeader}</Modal.Header>
            <Modal.Content>
                <p>
                    <LanguageKey stringId="progressUploadMapModalDescription" filename={filename}></LanguageKey>
                </p>
                <Grid.Row></Grid.Row>
                <Progress
                    label={t("progressUploadMapModalProgressLabel", { percent: percent })}
                    percent={percent}
                    indicating
                />
            </Modal.Content>
        </Modal>
    );
}

export default ProgressUploadMapModal;
