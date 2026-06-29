import React, { useContext, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import { Button, Header, Message } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { useBanlistTemplateDraft } from "../../hooks/useBanlistTemplateDraft";
import { BanlistViolationTemplateOutWeb } from "../../models/rest/Banlist";
import { BanlistService } from "../../services/BanlistService";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import BanlistTemplateGraduationTable from "./BanlistTemplateGraduationTable";
import BanlistTemplateMainSection from "./BanlistTemplateMainSection";
import BanlistTemplateResetSection from "./BanlistTemplateResetSection";

import "./BanlistTemplateEditor.scss";

interface BanlistTemplateEditorProps {
    banlistId: number;
    banlistApi: BanlistService;
    template?: BanlistViolationTemplateOutWeb | null;
    onClose: (reload?: boolean) => void | Promise<void>;
}

function BanlistTemplateEditor(props: BanlistTemplateEditorProps) {
    const { banlistId, banlistApi, template, onClose } = props;
    const isEdit = !!template;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const draft = useBanlistTemplateDraft(template);

    const [isSaving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async () => {
        setErrorMessage("");

        const result = draft.buildPayload();
        if (result.error !== null) {
            setErrorMessage(result.error);
            return;
        }

        setSaving(true);

        try {
            if (isEdit && template?.id !== undefined) {
                await banlistApi.patchTemplate(banlistId, template.id, result.payload);
                toast({ title: t("banlistTemplateUpdatedToast"), type: "success" });
            } else {
                await banlistApi.createTemplate(banlistId, result.payload);
                toast({ title: t("banlistTemplateCreatedToast"), type: "success" });
            }
        } catch (error) {
            setErrorMessage(convertErrorResponseToString(error));
            return;
        } finally {
            // сбрасываем до onClose: после него родитель размонтирует редактор
            setSaving(false);
        }

        await onClose(true);
    };

    return (
        <div className="banlist-template-editor">
            <div className="form-header">
                <Header as="h3">
                    {isEdit
                        ? t("banlistTemplateEditorEditHeader", { name: template?.name || "" })
                        : t("banlistTemplatesNew")}
                    <Header.Subheader>
                        {t("banlistTemplateEditorSubheader")}
                    </Header.Subheader>
                </Header>
                <div>
                    <Button onClick={() => void onClose(false)} type="button">
                        {t("cancel")}
                    </Button>
                    <Button
                        loading={isSaving}
                        onClick={() => void handleSubmit()}
                        primary
                        type="button"
                    >
                        {t("save")}
                    </Button>
                </div>
            </div>

            {errorMessage && <Message error>{errorMessage}</Message>}

            <div className="editor-grid">
                <BanlistTemplateMainSection draft={draft} />
                <BanlistTemplateResetSection draft={draft} />
                <BanlistTemplateGraduationTable draft={draft} />
            </div>
        </div>
    );
}

export default BanlistTemplateEditor;
