import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Button,
  Form,
  Grid,
  Icon,
  Input,
  Modal,
  TextArea,
} from "semantic-ui-react";

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
      <Form style={{ width: "100%" }}>
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
      <Modal
        open={previewModalOpen}
        closeIcon
        onClose={() => {
          setPreviewModalOpen(false);
        }}
      >
        <Modal.Header>Предпросмотр</Modal.Header>
        <Modal.Content>
          <ReactMarkdown>{formValue}</ReactMarkdown>
        </Modal.Content>
      </Modal>
    </>
  );
}

export default MapExternalDescriptionEdit;
