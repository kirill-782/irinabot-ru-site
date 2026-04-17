import React, { useContext, useEffect, useState } from "react";
import { Button, Form, Segment } from "semantic-ui-react";
import { AdminListOutWeb, AdminListPatchInWeb } from "../../models/rest/AdminList";
import { normalizeAdminListValueChangeType } from "../../utils/AdminListUtils";
import { AppRuntimeSettingsContext } from "../../context";

interface AdminListEditFormProps {
    list: AdminListOutWeb;
    isSaving: boolean;
    onCancel: () => void;
    onSave: (patch: AdminListPatchInWeb) => void;
}

const AdminListEditForm: React.FC<AdminListEditFormProps> = ({ list, isSaving, onCancel, onSave }) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const currentMode = normalizeAdminListValueChangeType(list.valueChangeType);
    const [commentDraft, setCommentDraft] = useState(list.comment || "");
    const [modeDraft, setModeDraft] = useState<"MAX" | "SET">(currentMode);

    useEffect(() => {
        setCommentDraft(list.comment || "");
        setModeDraft(normalizeAdminListValueChangeType(list.valueChangeType));
    }, [list.comment, list.valueChangeType]);

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
        <Segment>
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
                <div className="toolbar-actions">
                    <Button basic disabled={isSaving} onClick={onCancel} type="button">
                        {t("cancel")}
                    </Button>
                    <Button loading={isSaving} onClick={handleSave} primary type="button">
                        {t("save")}
                    </Button>
                </div>
            </Form>
        </Segment>
    );
};

export default AdminListEditForm;
