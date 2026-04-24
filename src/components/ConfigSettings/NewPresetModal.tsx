import React, { useState } from "react";
import { Button, Form, Modal } from "semantic-ui-react";

interface NewPresetModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (name: string) => Promise<void>;
}

function NewPresetModal({ open, onClose, onConfirm }: NewPresetModalProps) {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (!name.trim()) return;
        setIsLoading(true);
        try {
            await onConfirm(name.trim());
            setName("");
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setName("");
        onClose();
    };

    return (
        <Modal size="tiny" open={open} onClose={handleClose}>
            <Modal.Header>Новый пресет</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Input
                        label="Название"
                        placeholder="Введите название пресета"
                        value={name}
                        onChange={(_, data) => setName(data.value)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === "Enter") handleConfirm();
                        }}
                    />
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={handleClose}>Отмена</Button>
                <Button
                    primary
                    loading={isLoading}
                    disabled={!name.trim()}
                    onClick={handleConfirm}
                >
                    Создать
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default NewPresetModal;
