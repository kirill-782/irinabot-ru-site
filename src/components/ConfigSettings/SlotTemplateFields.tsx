import React, { useContext } from "react";
import { Form, Header } from "semantic-ui-react";
import { HostPresetSlotTemplate } from "../../models/rest/HostPreset";
import { AppRuntimeSettingsContext } from "../../context";

interface SlotTemplateFieldsProps {
    template: HostPresetSlotTemplate;
    onTemplateChange: (field: string, value: string) => void;
}

function SlotTemplateFields({ template, onTemplateChange }: SlotTemplateFieldsProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    return (
        <>
            <Header as="h4" dividing>
                {t("hostPresetSlotsTemplateHeader")}
            </Header>
            <Form.Group widths="equal">
                <Form.Input
                    label={t("hostPresetSlotsTemplateLoadCounter")}
                    value={template.loadCounter ?? ""}
                    onChange={(_, data) => onTemplateChange("loadCounter", data.value)}
                />
                <Form.Input
                    label={t("hostPresetSlotsTemplatePlayerName")}
                    value={template.playerName ?? ""}
                    onChange={(_, data) => onTemplateChange("playerName", data.value)}
                />
                <Form.Input
                    label={t("hostPresetSlotsTemplateRace")}
                    value={template.race ?? ""}
                    onChange={(_, data) => onTemplateChange("race", data.value)}
                />
            </Form.Group>
            <Form.Group widths="equal">
                <Form.Input
                    label={t("hostPresetSlotsTemplateTeam")}
                    value={template.team ?? ""}
                    onChange={(_, data) => onTemplateChange("team", data.value)}
                />
                <Form.Input
                    label={t("hostPresetSlotsTemplateHandicap")}
                    value={template.handicap ?? ""}
                    onChange={(_, data) => onTemplateChange("handicap", data.value)}
                />
            </Form.Group>
        </>
    );
}

export default SlotTemplateFields;
