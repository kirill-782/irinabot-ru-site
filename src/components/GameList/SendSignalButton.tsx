import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { Button, Icon, Input, Modal } from "semantic-ui-react";
import {
  AppRuntimeSettingsContext,
  AuthContext,
  WebsocketContext,
} from "../../context";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { AccessMaskBit } from "../Modal/AccessMaskModal";
import { ClientExternalSignalConverter } from "../../models/websocket/ClientExternalSignal";

interface SendSignalButtonProps {
  game: GameListGame;
}

function SendSignalButton({ game }: SendSignalButtonProps) {
  const sockets = useContext(WebsocketContext);
  const auth = useContext(AuthContext).auth;

  const [signalModalOpen, setSignalModalOpen] = useState(false);
  const [signal, setSignal] = useState("");

  const sendSignal = () => {
    sockets.ghostSocket.send(
      new ClientExternalSignalConverter().assembly({
        signal,
        gameId: game.gameCounter,
      })
    );
  };

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  useEffect(() => {
    setSignal("");
  }, []);

  if (
    auth.currentAuth?.connectorId !== game.creatorID &&
    !auth.accessMask.hasAccess(AccessMaskBit.ACCESS_ROOT)
  )
    return null;

  return (
    <>
      <Button
        icon="setting"
        basic
        size="mini"
        color="green"
        onClick={() => {
          setSignalModalOpen(true);
        }}
      />
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Modal
          closeIcon
          open={signalModalOpen}
          onClose={() => {
            setSignalModalOpen(false);
          }}
        >
          <Modal.Header>{t("modal.sendSignal.send")}</Modal.Header>
          <Modal.Content>
            <p>{t("modal.sendSignal.what")}</p>
            <Input
              placeholder={t("modal.sendSignal.sign")}
              value={signal}
              onChange={(_, data) => {
                setSignal(data.value);
              }}
              onKeyUp={(e: React.KeyboardEvent) => {
                if (e.code === "Enter") {
                  setSignalModalOpen(false);
                  sendSignal();
                }
              }}
            ></Input>
          </Modal.Content>
          <Modal.Actions>
            <Button color="red" onClick={() => setSignalModalOpen(false)}>
              <Icon name="x" />
              {t("modal.sendSignal.cancel")}
            </Button>
            <Button
              color="green"
              onClick={() => {
                setSignalModalOpen(false);
                sendSignal();
              }}
            >
              <Icon name="checkmark" />
              {t("modal.sendSignal.submit")}
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    </>
  );
}

export default SendSignalButton;
