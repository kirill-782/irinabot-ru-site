import { Grid, Modal, Progress } from "semantic-ui-react";
import { SyntheticEvent, useContext } from "react";
import React from "react";
import { AppRuntimeSettingsContext } from "../../context";

interface UploadMapModalProps {
  open: boolean;
  percent: number;
  filename: string;
  onClose: (event: SyntheticEvent, data: object) => void;
}

function ProgressUploadMapModal({
  open,
  percent,
  filename,
  onClose,
}: UploadMapModalProps) {
  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  return (
    <Modal open={open} onClose={onClose} closeIcon>
      <Modal.Header>{t("uploading.cation")}</Modal.Header>
      <Modal.Content>
        <p>
          {t("uploading.description.partOne")} <b>{filename}</b>{" "}
          {t("uploading.description.partTwo")}
        </p>
        <Grid.Row></Grid.Row>
        <Progress
          label={`${t("uploading.uploaded")} ${percent}%`}
          percent={percent}
          indicating
        />
      </Modal.Content>
    </Modal>
  );
}

export default ProgressUploadMapModal;
