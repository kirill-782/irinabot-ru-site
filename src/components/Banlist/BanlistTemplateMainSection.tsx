import React, { useContext } from "react";
import { Form, Header, Segment } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { UseBanlistTemplateDraftResult } from "../../hooks/useBanlistTemplateDraft";

interface BanlistTemplateMainSectionProps {
    draft: UseBanlistTemplateDraftResult;
}

function BanlistTemplateMainSection({ draft }: BanlistTemplateMainSectionProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    return (
        <Segment>
            <Header as="h4">{t("banlistTemplateEditorMainHeader")}</Header>
            <Form>
                <Form.Input
                    label={t("banlistTemplateEditorNameLabel")}
                    onChange={(_, data) => draft.setName(data.value)}
                    placeholder={t("banlistTemplateEditorNamePlaceholder")}
                    value={draft.name}
                />
                <Form.Input
                    label={t("banlistTemplateEditorTagLabel")}
                    onChange={(_, data) => draft.setTag(data.value)}
                    placeholder="spam"
                    value={draft.tag}
                />
                <Form.TextArea
                    label={t("banlistTemplateEditorReasonLabel")}
                    onChange={(_, data) => draft.setReason(String(data.value || ""))}
                    placeholder={t("banlistTemplateEditorReasonPlaceholder")}
                    rows={4}
                    value={draft.reason}
                />
            </Form>
        </Segment>
    );
}

export default BanlistTemplateMainSection;
