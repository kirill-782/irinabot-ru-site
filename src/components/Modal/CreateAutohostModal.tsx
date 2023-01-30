import { Button, Form, Header, Message, Modal } from "semantic-ui-react";
import { useContext, useState } from "react";
import React from "react";
import SpaceId from "../SpaceId";
import { AppRuntimeSettingsContext, AuthContext } from "../../context";

export interface AuthostModalData {
  gameName: string;
  autostart: number;
  countGames: number;
  hcl: string;
  spaceId: number;
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
  const { currentAuth } = useContext(AuthContext).auth;

  const [gameName, setGameName] = useState<string>(defaultGameName || "");
  const [autostart, setAutostart] = useState<string>(
    defaultAutostart?.toString() || ""
  );
  const [countGames, setCountGames] = useState<string>("10");
  const [hcl, setHcl] = useState<string>("");
  const [spaceId, setSpaceId] = useState<number>(currentAuth?.connectorId || 0);

  const gameNameHasError = gameName.length > 30 || gameName.length === 0;
  const autostartHasError = isNaN(parseInt(autostart));
  const countGamesHasError = isNaN(parseInt(countGames));
  
  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  return (
    <Modal open={open} onClose={onClose} closeIcon size="tiny">
      <Header content={t("modal.createAutohost.caption")} />
      <Modal.Content>
        <Message>
          <p>
            {t("modal.createAutohost.description")}
          </p>
        </Message>
        <Form>
          <Form.Input
            fluid
            error={gameNameHasError}
            label={t("modal.createAutohost.label.gamename")}
            placeholder={t("modal.createAutohost.placeholder.gamename")}
            value={gameName}
            onChange={(e, data) => {
              setGameName(data.value);
            }}
          />
          <Form.Group widths="equal">
            <Form.Input
              fluid
              error={autostartHasError}
              label={t("modal.createAutohost.label.autostart")}
              placeholder={t("modal.createAutohost.placeholder.autostart")}
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
              label={t("modal.createAutohost.label.gamelimit")}
              placeholder={t("modal.createAutohost.placeholder.gamelimit")}
              pattern="[0-9]*"
              value={countGames}
              type="number"
              onChange={(e, data) => {
                setCountGames(data.value);
              }}
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={t("modal.createAutohost.label.hcl")}
              placeholder={t("modal.createAutohost.placeholder.hcl")}
              value={hcl}
              onChange={(e, data) => {
                setHcl(data.value);
              }}
            />
            <SpaceId
              fluid
              requiredAccessMask={32}
              label="SpaceId"
              value={spaceId}
              onChange={(spaceID) => {
                setSpaceId(spaceID);
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
                hcl,
                spaceId,
              });
            }}
          >
            {t("modal.createAutohost.tocreate")}
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
}

export default CreateAutohostModal;
