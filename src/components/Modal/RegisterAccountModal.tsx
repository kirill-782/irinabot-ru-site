import React, { useContext } from "react";
import { Button, Icon, Modal } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";

interface RegisterAccountModalProps {
    open: boolean;
    onApprove: () => void;
    onReject: () => void;
}

function RegisterAccountModal({ open, onApprove, onReject }: RegisterAccountModalProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    return (
        <Modal open={open} className="register-modal">
            <Modal.Header>{lang.registerAccountModalHeader}</Modal.Header>

            <Modal.Content>
                <Modal.Description>{lang.registerAccountModalDescription}</Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    color="red"
                    onClick={() => {
                        onReject();
                    }}
                >
                    <Icon name="remove" /> {lang.no}
                </Button>
                <Button
                    color="green"
                    onClick={() => {
                        onApprove();
                    }}
                >
                    <Icon name="checkmark" /> {lang.yes}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default RegisterAccountModal;
