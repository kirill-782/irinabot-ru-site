import React, { useContext, useState } from "react";
import { Button, Checkbox, Form, Header, Icon, Modal } from "semantic-ui-react";
import { toast } from "@kokomi/react-semantic-toasts";
import { HostPresetSlots } from "../../models/rest/HostPreset";
import SlotTemplateFields from "./SlotTemplateFields";
import VariableSourceItem from "./VariableSourceItem";
import ConditionVariableEditor from "./ConditionVariableEditor";
import { parseLegacySlotsJson } from "./legacySlotsImport";
import { AppRuntimeSettingsContext } from "../../context";

interface SlotsSectionProps {
    slots: HostPresetSlots;
    onSlotsChange: (slots: HostPresetSlots) => void;
}

function SlotsSection({ slots, onSlotsChange }: SlotsSectionProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [expandedSourceIndex, setExpandedSourceIndex] = useState<number | null>(null);

    const variableSources = slots.variableSources ?? [];
    const template = slots.template ?? {};

    const updateField = (field: keyof HostPresetSlots, value: any) => {
        onSlotsChange({ ...slots, [field]: value });
    };

    const updateTemplate = (field: string, value: string) => {
        onSlotsChange({ ...slots, template: { ...template, [field]: value } });
    };

    const updateVariableSource = (index: number, field: string, value: any) => {
        const newSources = [...variableSources];
        const current = newSources[index];
        if (field === "type") {
            // Payload is a flat union — reset the opposite field so only one survives on the wire.
            newSources[index] = {
                ...current,
                type: value,
                payload: value === 2 ? { data: {} } : { url: "" },
            };
        } else if (field === "prefix" || field === "enabled") {
            newSources[index] = { ...current, [field]: value };
        } else {
            newSources[index] = {
                ...current,
                payload: { ...current.payload, [field]: value },
            };
        }
        onSlotsChange({ ...slots, variableSources: newSources });
    };

    const addVariableSource = () => {
        onSlotsChange({
            ...slots,
            variableSources: [
                ...variableSources,
                { prefix: "", type: 1, enabled: false, payload: { url: "" } },
            ],
        });
    };

    const removeVariableSource = (index: number) => {
        onSlotsChange({
            ...slots,
            variableSources: variableSources.filter((_, i) => i !== index),
        });
    };

    const importFromLegacy = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const imported = parseLegacySlotsJson(text);
            onSlotsChange(imported);
            toast({ title: t("hostPresetSlotsLegacyJsonImported"), type: "success" });
        } catch (e) {
            toast({
                title: t("hostPresetSlotsImportError"),
                description: (e as Error).message,
                type: "error",
                time: 10000,
            });
        }
    };

    const expandedSource =
        expandedSourceIndex !== null ? variableSources[expandedSourceIndex] : null;

    return (
        <div className="config-section">
            <Form>
                <Form.Group widths="equal">
                    <Form.Input
                        label={t("hostPresetSlotsUndefinedValue")}
                        value={slots.undefinedValue ?? ""}
                        onChange={(_, data) => updateField("undefinedValue", data.value)}
                    />
                    <Form.Field>
                        <label>&nbsp;</label>
                        <Checkbox
                            toggle
                            label={t("hostPresetSlotsEnableUserTemplate")}
                            checked={!!slots.enableUserTemplate}
                            onChange={(_, data) => updateField("enableUserTemplate", data.checked)}
                        />
                    </Form.Field>
                </Form.Group>

                <SlotTemplateFields template={template} onTemplateChange={updateTemplate} />

                <Header as="h4" dividing>
                    {t("hostPresetSlotsVariableSourcesHeader")}
                </Header>

                {variableSources.map((source, index) => {
                    const prefix = (source.prefix ?? "").trim();
                    const enabled = prefix !== "" && !!source.enabled;

                    const toggleEnabled = () => {
                        if (!prefix) return;
                        updateVariableSource(index, "enabled", !enabled);
                    };

                    return (
                        <VariableSourceItem
                            key={index}
                            source={source}
                            index={index}
                            enabled={enabled}
                            onToggleEnabled={toggleEnabled}
                            onFieldChange={updateVariableSource}
                            onRemove={removeVariableSource}
                            onExpand={setExpandedSourceIndex}
                        />
                    );
                })}

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button icon labelPosition="left" size="small" onClick={addVariableSource}>
                        <Icon name="plus" />
                        {t("hostPresetSlotsAddVariableSource")}
                    </Button>
                    <Button
                        basic
                        icon
                        labelPosition="left"
                        size="small"
                        onClick={() => { void importFromLegacy(); }}
                        type="button"
                    >
                        <Icon name="paste" />
                        {t("hostPresetSlotsPasteLegacyJson")}
                    </Button>
                </div>
            </Form>

            <Modal
                open={expandedSourceIndex !== null}
                onClose={() => setExpandedSourceIndex(null)}
                size="fullscreen"
                closeIcon
            >
                <Modal.Header>
                    {t("hostPresetSlotsConditionalSourceModalTitle", {
                        index: (expandedSourceIndex ?? 0) + 1,
                    })}
                    {expandedSource && (
                        <> &mdash; {expandedSource.prefix || t("hostPresetSlotsConditionalSourceNoPrefix")}</>
                    )}
                </Modal.Header>
                <Modal.Content scrolling>
                    {expandedSourceIndex !== null && expandedSource && (
                        <ConditionVariableEditor
                            data={expandedSource.payload?.data}
                            onChange={(value) =>
                                updateVariableSource(expandedSourceIndex, "data", value)
                            }
                        />
                    )}
                </Modal.Content>
            </Modal>
        </div>
    );
}

export default SlotsSection;
