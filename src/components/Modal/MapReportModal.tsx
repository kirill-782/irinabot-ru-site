import React, { useState } from "react";
import { Button, Form, Message, Modal } from "semantic-ui-react";

interface MapReportModalProps {
  mapId: number;
  open: boolean;
  onClose: () => void;
}

const reasonOptions = [
  {
    text: "(не указано)",
    value: 0,
  },
  {
    text: "Заявка на верификацию",
    value: 1,
  },
  {
    text: "Ошибки автоматического обнаружения читпака",
    value: 2,
  },
  {
    text: "Ошибки при заполнении категорий",
    value: 3,
  },
];

function MapReportModal({ open, onClose, mapId }: MapReportModalProps) {
  const [type, setType] = useState(0);
  const [comment, setComment] = useState("");
  const [source, setSource] = useState("");

  const send = () => {
    let string =
      "**Тип обращения:**" +
      reasonOptions.filter((i) => {
        return i.value === type;
      })[0].text +
      "\r\n";

    string += `**Номер карты:** ${mapId}\r\n`;

    if (source) string += `**Источник:** ${source}\r\n`;

    if (comment) string += `**Комментарий:** ${comment}\r\n`;

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
      <Modal.Header>Сообщить о карте</Modal.Header>
      <Modal.Content>
        <Message info>
          <p>
            Вас перенаправит на XGM. Заполните название ресурса и нажмите кнопку
            создать
          </p>
        </Message>
        <Form>
          <Form.Select
            label="Тип обращения"
            options={reasonOptions}
            value={type}
            onChange={(_, data) => {
              setType(parseInt(data.value?.toString() || "0"));
            }}
          ></Form.Select>
          {type === 1 && (
            <Form.TextArea
              label="Источник"
              value={source}
              onChange={(_, data) => {
                setSource(data.value?.toString() || "");
              }}
            ></Form.TextArea>
          )}
          {type !== 0 && (
            <Form.TextArea
              label="Комментарий"
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
            Отправить
          </Form.Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
}

export default MapReportModal;
