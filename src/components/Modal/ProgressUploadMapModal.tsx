import { Grid, Modal, Progress } from "semantic-ui-react";
import { SyntheticEvent } from "react";
import React from "react";

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
  return (
    <Modal open={open} onClose={onClose} closeIcon>
      <Modal.Header>Загрузка карты</Modal.Header>
      <Modal.Content>
        <p>
          Файл <b>{filename}</b> загружается. Пожалуйста дождитесь окончания
          загрузки.
        </p>
        <Grid.Row></Grid.Row>
        <Progress
          label={`Загружено ${percent}%`}
          percent={percent}
          indicating
        />
      </Modal.Content>
    </Modal>
  );
}

export default ProgressUploadMapModal;
