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
  const lang = language.languageRepository;
  return (
    <Modal open={open} onClose={onClose} closeIcon>
      <Modal.Header>{lang.modal_uploading_caption}</Modal.Header>
      <Modal.Content>
        <p>
          {lang.fileMapUploading}
        </p>
        <Grid.Row></Grid.Row>
        <Progress
          label={`${lang.uploaded} ${percent}%`}
          percent={percent}
          indicating
        />
      </Modal.Content>
    </Modal>
  );
}

export default ProgressUploadMapModal;
