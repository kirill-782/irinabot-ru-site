import React, { useContext, useState } from "react";
import { Button, Form, Message, Modal } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";

// TODO: Рассмотреть хорошенько..

interface MapReportModalProps {
  mapId: number;
  open: boolean;
  onClose: () => void;
}

const reasonOptions = [
  {
    text: "modal.mapReport.options.defaulth", // Не указано
    value: 0,
  },
  {
    text: "modal.mapReport.options.verify", // Заявка на верификацию
    value: 1,
  },
  {
    text: "modal.mapReport.options.errorCheatPackDetector", // Ошибка авто-обнаружения читпака
    value: 2,
  },
  {
    text: "modal.mapReport.options.errorCategory", // Ошибка при заполнении категории 
    value: 3,
  },
];

function MapReportModal({ open, onClose, mapId }: MapReportModalProps) {
  const [type, setType] = useState(0);
  const [comment, setComment] = useState("");
  const [source, setSource] = useState("");
  
  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  const send = () => {
    let string =
      "**"+t("modal.mapReport.send.type")+":**" +
      t(reasonOptions.filter((i) => {
        return i.value === type;
      })[0].text) +
      "\r\n";

    string += `**${t("modal.mapReport.send.link")}:** __#${mapId}__ (https://irinabot.ru/maps/${mapId})\r\n`;

    if (source) string += `**${t("modal.mapReport.send.source")}:** ${source}\r\n`;

    if (comment) string += `**${t("modal.mapReport.send.comment")}:** ${comment}\r\n`;

    window.location.href = `https://xgm.guru/p/irina/add/219?initial-text=${encodeURIComponent(
      string
    )}`;
  };

  return (
    <Modal
      closeIcon
      open={open}
      onClose={() => {
        onClose();
      }}
    >
      <Modal.Header>{t("modal.mapReport.caption")}</Modal.Header>
      <Modal.Content>
        <Message info>
          <p>
          {t("modal.mapReport.info")}
          </p>
        </Message>
        <Form>
          <Form.Select
            label={t("modal.mapReport.type")}
            options={reasonOptions.map((i)=>{
              return { ...i, text: t(i.text) }
            })}
            value={type}
            onChange={(_, data) => {
              setType(parseInt(data.value?.toString() || "0"));
            }}
          ></Form.Select>
          {type === 1 && (
            <Form.TextArea
              label={t("modal.mapReport.source")}
              value={source}
              onChange={(_, data) => {
                setSource(data.value?.toString() || "");
              }}
            ></Form.TextArea>
          )}
          {type !== 0 && (
            <Form.TextArea
              label={t("modal.mapReport.comment")}
              value={comment}
              onChange={(_, data) => {
                setComment(data.value?.toString() || "");
              }}
            ></Form.TextArea>
          )}
          <Form.Button
            disabled={type === 0}
            onClick={() => {
              send();
            }}
          >
            {t("modal.mapReport.tosend")}
          </Form.Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
}

export default MapReportModal;
