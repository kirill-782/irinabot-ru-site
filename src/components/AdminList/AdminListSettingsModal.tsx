import React, { useContext, useEffect, useState } from "react";
import { Button, Form, Modal } from "semantic-ui-react";
import { AdminListOutWeb, AdminListPatchInWeb } from "../../models/rest/AdminList";
import { normalizeAdminListValueChangeType } from "../../utils/AdminListUtils";
import { AppRuntimeSettingsContext } from "../../context";

interface AdminListSettingsModalProps {
    open: boolean;
    list: AdminListOutWeb;
    isSaving: boolean;
    // Удаление списка живёт здесь же. Кнопку показываем и без права удаления —
    // так рядом с ней читается причина (стандартный список / не владелец),
    // как это было в панели над карточкой.
    canDelete: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onSave: (patch: AdminListPatchInWeb) => void;
    onDelete: () => void;
}

const AdminListSettingsModal: React.FC<AdminListSettingsModalProps> = ({
    open,
    list,
    isSaving,
    canDelete,
    isDeleting,
    onClose,
    onSave,
    onDelete,
}) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const currentMode = normalizeAdminListValueChangeType(list.valueChangeType);
    const [commentDraft, setCommentDraft] = useState(list.comment || "");
    const [modeDraft, setModeDraft] = useState<"MAX" | "SET">(currentMode);

    // Черновики поднимаются заново на каждое открытие — отменённые правки
    // не переживают закрытие модалки.
    useEffect(() => {
        if (!open) return;

        setCommentDraft(list.comment || "");
        setModeDraft(normalizeAdminListValueChangeType(list.valueChangeType));
    }, [open, list.comment, list.valueChangeType]);

    const handleSave = () => {
        const trimmedComment = commentDraft.trim();
        const originalComment = (list.comment || "").trim();
        const patch: AdminListPatchInWeb = {};

        if (trimmedComment !== originalComment) {
            patch.comment = trimmedComment ? trimmedComment : null;
        }
        if (modeDraft !== currentMode) {
            patch.valueChangeType = modeDraft;
        }

        onSave(patch);
    };

    return (
        <Modal onClose={onClose} open={open} size="tiny">
            <Modal.Header>{t("adminListSettingsHeader")}</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.TextArea
                        label={t("adminListEditComment")}
                        onChange={(_, data) => setCommentDraft(String(data.value ?? ""))}
                        placeholder={t("adminListEditCommentPlaceholder")}
                        rows={3}
                        value={commentDraft}
                    />
                    <Form.Group inline>
                        <label>{t("adminListEditValueMode")}</label>
                        <Form.Radio
                            checked={modeDraft === "MAX"}
                            label="MAX"
                            onChange={() => setModeDraft("MAX")}
                        />
                        <Form.Radio
                            checked={modeDraft === "SET"}
                            label="SET"
                            onChange={() => setModeDraft("SET")}
                        />
                    </Form.Group>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    color="red"
                    disabled={!canDelete || isSaving}
                    loading={isDeleting}
                    onClick={onDelete}
                    style={{ float: "left" }}
                    type="button"
                >
                    {t("adminListButtonDeleteList")}
                </Button>
                <Button basic disabled={isSaving} onClick={onClose} type="button">
                    {t("cancel")}
                </Button>
                <Button loading={isSaving} onClick={handleSave} primary type="button">
                    {t("save")}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default AdminListSettingsModal;
