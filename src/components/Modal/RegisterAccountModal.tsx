import React from "react";
import { Button, Icon, Modal } from "semantic-ui-react";

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
  return (
    <Modal open={open}>
      <Modal.Header>Регистрация аккаунта</Modal.Header>

      <Modal.Content>
        <Modal.Description>
          Вы с данного акканта входите впервые. Выполнить регистрацию аккаунта с
          помощью данного способа входа? В будущем вы не сможете отвязать
          аккаунт социальной сети от аккаунта бота.
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button
          color="red"
          onClick={() => {
            onReject();
          }}
        >
          <Icon name="remove" /> Да
        </Button>
        <Button
          color="green"
          onClick={() => {
            onApprove();
          }}
        >
          <Icon name="checkmark" /> Нет
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default RegisterAccountModal;
