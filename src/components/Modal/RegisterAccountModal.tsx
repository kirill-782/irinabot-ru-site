import React, { useContext } from "react";
import { Button, Icon, Modal } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";

interface RegisterAccountModalProps {
  open: boolean;
  onApprove: () => void;
  onReject: () => void;
}

function RegisterAccountModal({
  open,
  onApprove,
  onReject,
}: RegisterAccountModalProps) {
  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  return (
    <Modal open={open} className="register-modal">
      <Modal.Header>{t("modal.register.caption")}</Modal.Header>

      <Modal.Content>
        <Modal.Description>{t("modal.register.description")}</Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button
          color="red"
          onClick={() => {
            onReject();
          }}
        >
          <Icon name="remove" /> {t("modal.register.no")}
        </Button>
        <Button
          color="green"
          onClick={() => {
            onApprove();
          }}
        >
          <Icon name="checkmark" /> {t("modal.register.yes")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default RegisterAccountModal;
