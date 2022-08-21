import { Button, Form, Header, Message, Modal } from "semantic-ui-react";
import { useState } from "react";
import React from "react";

export interface AuthostModalData {
  gameName: string;
  autostart: number;
  countGames: number;
}

interface CreateAutohostModalProps {
  defaultGameName?: string;
  defaultAutostart?: number;
  open: boolean;
  onClose: () => void;
  onCreate: (data: AuthostModalData) => void;
}

function CreateAutohostModal({
  defaultGameName,
  defaultAutostart,
  onCreate,
  open,
  onClose,
}: CreateAutohostModalProps) {
  const [gameName, setGameName] = useState<string>(defaultGameName || "");
  const [autostart, setAutostart] = useState<string>(
    defaultAutostart?.toString() || ""
  );
  const [countGames, setCountGames] = useState<string>("10");

  const gameNameHasError = gameName.length > 30 || gameName.length === 0;
  const autostartHasError = isNaN(parseInt(autostart));
  const countGamesHasError = isNaN(parseInt(countGames));

  return (
    <Modal open={open} onClose={onClose} closeIcon size="tiny">
      <Header content="Создание автохоста" />
      <Modal.Content>
        <Message>
          <p>
            Бот будет автоматически создавать игры с настроенным автостартом.
            Один автохост создает одно лобби.
          </p>
        </Message>
        <Form>
          <Form.Input
            fluid
            error={gameNameHasError}
            label="Имя игры"
            placeholder="Имя игры"
            value={gameName}
            onChange={(e, data) => {
              setGameName(data.value);
            }}
          />
          <Form.Group widths="equal">
            <Form.Input
              fluid
              error={autostartHasError}
              label="Автостарт при игроках"
              placeholder="Автостарт"
              pattern="[0-9]*"
              type="number"
              value={autostart}
              onChange={(e, data) => {
                setAutostart(data.value);
              }}
            />
            <Form.Input
              fluid
              error={countGamesHasError}
              label="Лимит игр"
              placeholder="Лимит игр"
              pattern="[0-9]*"
              value={countGames}
              type="number"
              onChange={(e, data) => {
                setCountGames(data.value);
              }}
            />
          </Form.Group>
          <Button
            fluid
            color="green"
            onClick={() => {
              onCreate({
                gameName,
                countGames: parseInt(countGames),
                autostart: parseInt(autostart),
              });
            }}
          >
            Создать
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
}

export default CreateAutohostModal;
