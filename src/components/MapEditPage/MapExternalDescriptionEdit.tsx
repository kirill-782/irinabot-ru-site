import React, { useContext, useEffect, useState } from "react";

import { Button, Form, Icon, Modal } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
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

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  
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
              {t("page.map.edit.xdescription.save")}
            </Button>
          )}
          <Button
            onClick={() => {
              setPreviewModalOpen(true);
            }}
            color="green"
          >
            {t("page.map.edit.xdescription.preview")}
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
        <Modal.Header>{t("page.map.edit.xdescription.previews")}</Modal.Header>
        <Modal.Content>
          <Markdown>{formValue}</Markdown>
        </Modal.Content>
      </Modal>
    </>
  );
}

export default MapExternalDescriptionEdit;
