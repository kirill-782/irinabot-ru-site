import React from "react";
import { Button, Dropdown, Icon, Segment } from "semantic-ui-react";
import { HostPresetListItemOutWeb } from "../../models/rest/HostPreset";

interface ConfigToolbarProps {
    presets: HostPresetListItemOutWeb[];
    presetsLoading: boolean;
    selectedPresetId: number | null;
    onSelectPreset: (id: number | null) => void;
    onNewPreset: () => void;
    onDeletePreset: () => void;
    hasChanges: boolean;
    isSaving: boolean;
    onSave: () => void;
    onReset: () => void;
}

function ConfigToolbar({
    presets,
    presetsLoading,
    selectedPresetId,
    onSelectPreset,
    onNewPreset,
    onDeletePreset,
    hasChanges,
    isSaving,
    onSave,
    onReset,
}: ConfigToolbarProps) {
    const presetOptions = presets.map((p) => ({
        key: p.id,
        value: p.id,
        text: p.name ?? `Пресет #${p.id}`,
    }));

    return (
        <Segment className="config-toolbar">
            <div className="config-toolbar-row">
                <Dropdown
                    placeholder="Выберите пресет..."
                    selection
                    options={presetOptions}
                    value={selectedPresetId ?? undefined}
                    loading={presetsLoading}
                    onChange={(_, data) => onSelectPreset(data.value as number)}
                    className="config-preset-select"
                />
                <Button icon labelPosition="left" onClick={onNewPreset}>
                    <Icon name="plus" />
                    Новый пресет
                </Button>
                {selectedPresetId !== null && (
                    <Button icon color="red" basic onClick={onDeletePreset}>
                        <Icon name="trash" />
                    </Button>
                )}

                {hasChanges && (
                    <div className="config-changes-inline">
                        <Icon name="warning sign" color="yellow" />
                        <span className="config-changes-label">
                            Несохранённые изменения
                        </span>
                        <Button primary size="small" loading={isSaving} onClick={onSave}>
                            <Icon name="save" />
                            Сохранить
                        </Button>
                        <Button size="small" onClick={onReset}>
                            <Icon name="undo" />
                            Сбросить
                        </Button>
                    </div>
                )}
            </div>
        </Segment>
    );
}

export default ConfigToolbar;
