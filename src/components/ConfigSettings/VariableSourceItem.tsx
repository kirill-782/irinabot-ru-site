import React, { useContext, useMemo } from "react";
import { Button, Checkbox, Dropdown, Form, Label, Segment } from "semantic-ui-react";
import { HostPresetVariableSource } from "../../models/rest/HostPreset";
import ConditionVariableEditor from "./ConditionVariableEditor";
import { AppRuntimeSettingsContext } from "../../context";

interface VariableSourceItemProps {
    source: HostPresetVariableSource;
    index: number;
    enabled: boolean;
    onToggleEnabled: () => void;
    onFieldChange: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
    onExpand: (index: number) => void;
}

function VariableSourceItem({ source, index, enabled, onToggleEnabled, onFieldChange, onRemove, onExpand }: VariableSourceItemProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const sourceTypeOptions = useMemo(
        () => [
            { key: 1, value: 1, text: t("hostPresetVariableSourceTypeUrl") },
            { key: 2, value: 2, text: t("hostPresetVariableSourceTypeCondition") },
        ],
        [t]
    );

    const isCondition = (source.type ?? 1) === 2;
    const prefixEmpty = !(source.prefix ?? "").trim();

    return (
        <Segment className="variable-source-item">
            <div className="variable-source-header">
                <div className="left">
                    <Label color="blue" size="small">#{index + 1}</Label>
                    <Checkbox
                        toggle
                        checked={enabled}
                        onChange={onToggleEnabled}
                        disabled={prefixEmpty}
                        title={prefixEmpty ? t("hostPresetVariableSourcePrefixHint") : ""}
                    />
                    {isCondition && (
                        <Button
                            basic
                            compact
                            icon="expand"
                            onClick={() => onExpand(index)}
                            size="mini"
                            title={t("hostPresetVariableSourceExpand")}
                            type="button"
                        />
                    )}
                </div>
                <Button
                    icon="trash"
                    size="mini"
                    color="red"
                    basic
                    onClick={() => onRemove(index)}
                />
            </div>

            <Form.Group widths="equal">
                <Form.Input
                    label={t("hostPresetVariableSourcePrefix")}
                    value={source.prefix ?? ""}
                    onChange={(_, data) => onFieldChange(index, "prefix", data.value)}
                />
                <Form.Field>
                    <label>{t("hostPresetVariableSourceType")}</label>
                    <Dropdown
                        selection
                        options={sourceTypeOptions}
                        value={source.type ?? 1}
                        onChange={(_, data) => onFieldChange(index, "type", data.value)}
                    />
                </Form.Field>
            </Form.Group>

            {!isCondition ? (
                <Form.Input
                    label={t("hostPresetVariableSourceUrl")}
                    value={source.payload?.url ?? ""}
                    onChange={(_, data) => onFieldChange(index, "url", data.value)}
                />
            ) : (
                <ConditionVariableEditor
                    data={source.payload?.data}
                    onChange={(value) => onFieldChange(index, "data", value)}
                />
            )}
        </Segment>
    );
}

export default VariableSourceItem;
