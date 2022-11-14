import React, { useEffect, useState } from "react";

import { Button, Form, Icon, Modal } from "semantic-ui-react";
import Markdown from "../Markdown";

import "./MapExternalDescriptionEdit.scss";

interface MapExternalDescriptionEditProps {
  value?: string;
  onChange?: (value: string | null) => void;
  loading?: boolean;
}

function MapExternalDescriptionEdit({
  value,
  onChange,
  loading,
}: MapExternalDescriptionEditProps) {
  const [formValue, setFormValue] = useState<string>(value || "");

  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    setFormValue(value || "");
  }, [value]);

  return (
    <>
      <div className="map-external-description">
        <Form>
          <Form.TextArea
            value={formValue}
            onChange={(_, data) => {
              setFormValue(data.value?.toString() || "");
            }}
          ></Form.TextArea>
          {onChange && (
            <Button
              loading={loading}
              onClick={() => {
                onChange(formValue || null);
              }}
              color="green"
            >
              <Icon name="save" />
              Сохранить
            </Button>
          )}
          <Button
            onClick={() => {
              setPreviewModalOpen(true);
            }}
            color="green"
          >
            Предпросмотр
          </Button>
        </Form>
      </div>

      <Modal
        open={previewModalOpen}
        closeIcon
        onClose={() => {
          setPreviewModalOpen(false);
        }}
      >
        <Modal.Header>Предпросмотры</Modal.Header>
        <Modal.Content>
          <Markdown>{formValue}</Markdown>
        </Modal.Content>
      </Modal>
    </>
  );
}

export default MapExternalDescriptionEdit;
