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
  const lang = language.languageRepository;

  const send = () => {
    let string =
      "**" +
      lang.modal_mapReport_send_type +
      ":**" +
      t(
        reasonOptions.filter((i) => {
          return i.value === type;
        })[0].text
      ) +
      "\r\n";

    string += `**${t(
      "modal.mapReport.send.link"
    )}:** __#${mapId}__ (https://irinabot.ru/maps/${mapId})\r\n`;

    if (source)
      string += `**${lang.modal_mapReport_send_source}:** ${source}\r\n`;

    if (comment)
      string += `**${lang.modal_mapReport_send_comment}:** ${comment}\r\n`;

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
      <Modal.Header>{lang.mapReport}</Modal.Header>
      <Modal.Content>
        <Message info>
          <p>{lang.infoRedirectionXGM}</p>
        </Message>
        <Form>
          <Form.Select
            label={lang.typeReport}
            options={reasonOptions.map((i) => {
              return { ...i, text: t(i.text) };
            })}
            value={type}
            onChange={(_, data) => {
              setType(parseInt(data.value?.toString() || "0"));
            }}
          ></Form.Select>
          {type === 1 && (
            <Form.TextArea
              label={lang.source}
              value={source}
              onChange={(_, data) => {
                setSource(data.value?.toString() || "");
              }}
            ></Form.TextArea>
          )}
          {type !== 0 && (
            <Form.TextArea
              label={lang.comment}
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
            {lang.modal_mapReport_tosend}
          </Form.Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
}

export default MapReportModal;
