import React from "react";
import {
    Button,
    Checkbox,
    Dropdown,
    Form,
    Icon,
    Input,
    Label,
    Popup,
    TextArea,
} from "semantic-ui-react";

export interface PropertyValidation {
    min?: number;
    max?: number;
    enum?: number[];
    nonZeroMin?: number;
    minLineLength?: number;
    maxLineLength?: number;
    maxLines?: number;
    bitmask?: Record<string, string>;
}

export interface ConfigProperty {
    name: string;
    title: string;
    type: "bool" | "string" | "number" | "text";
    category: string;
    description?: string;
    validation?: PropertyValidation;
}

export interface PropertyFieldProps {
    property: ConfigProperty;
    value: any;
    onChange: (name: string, value: any) => void;
    onDelete?: (name: string) => void;
}

export function camelToReadable(name: string): string {
    return name
        .replace(/^(bot|api|replay)/, "")
        .replace(/([A-Z])/g, " $1")
        .replace(/^\s+/, "")
        .trim();
}

function DescriptionPopup({ description }: { description: string }) {
    return (
        <Popup
            trigger={<Icon name="info circle" size="small" />}
            content={description}
            position="top center"
        />
    );
}

function BoolField({ property, value, onChange }: PropertyFieldProps) {
    return (
        <Form.Field>
            <Checkbox
                toggle
                label={property.title}
                checked={!!value}
                onChange={(_, data) => onChange(property.name, data.checked)}
            />
            {property.description && (
                <div className="field-description">{property.description}</div>
            )}
        </Form.Field>
    );
}

function NumberField({ property, value, onChange }: PropertyFieldProps) {
    const validation = property.validation;

    if (validation?.enum) {
        const options = validation.enum.map((v) => ({ key: v, value: v, text: String(v) }));
        return (
            <Form.Field>
                <label>
                    {property.title}
                    {property.description && <DescriptionPopup description={property.description} />}
                </label>
                <Dropdown
                    selection
                    options={options}
                    value={value ?? 0}
                    onChange={(_, data) => onChange(property.name, data.value)}
                />
                {property.description && (
                    <div className="field-description">{property.description}</div>
                )}
            </Form.Field>
        );
    }

    if (validation?.bitmask) {
        const entries = Object.entries(validation.bitmask);
        const currentValue = (value as number) || 0;
        return (
            <Form.Field>
                <label>
                    {property.title}
                    {property.description && <DescriptionPopup description={property.description} />}
                </label>
                <div className="bitmask-group">
                    {entries.map(([bit, label]) => {
                        const bitValue = parseInt(bit);
                        const isChecked = (currentValue & bitValue) !== 0;
                        return (
                            <Checkbox
                                key={bit}
                                label={`${label} (${bit})`}
                                checked={isChecked}
                                onChange={() => {
                                    const newVal = isChecked
                                        ? currentValue & ~bitValue
                                        : currentValue | bitValue;
                                    onChange(property.name, newVal);
                                }}
                            />
                        );
                    })}
                </div>
                <Label basic size="small">
                    Значение: {currentValue}
                </Label>
            </Form.Field>
        );
    }

    return (
        <Form.Field>
            <label>
                {property.title}
                {property.description && <DescriptionPopup description={property.description} />}
            </label>
            <Input
                type="number"
                value={value ?? ""}
                min={validation?.min}
                max={validation?.max}
                onChange={(_, data) =>
                    onChange(property.name, data.value === "" ? "" : Number(data.value))
                }
            />
        </Form.Field>
    );
}

function StringField({ property, value, onChange }: PropertyFieldProps) {
    const max = property.validation?.max;
    return (
        <Form.Field>
            <label>
                {property.title}
                {property.description && <DescriptionPopup description={property.description} />}
            </label>
            <Input
                value={value ?? ""}
                maxLength={max ? parseInt(String(max)) : undefined}
                onChange={(_, data) => onChange(property.name, data.value)}
            />
        </Form.Field>
    );
}

function TextField({ property, value, onChange }: PropertyFieldProps) {
    const validation = property.validation;
    const lines = (value ?? "").split("\n");
    const maxLines = validation?.maxLines ?? 8;

    return (
        <Form.Field>
            <label>
                {property.title}
                {property.description && <DescriptionPopup description={property.description} />}
            </label>
            <TextArea
                rows={Math.min(maxLines, Math.max(3, lines.length + 1))}
                value={value ?? ""}
                onChange={(_, data) => {
                    const newLines = String(data.value).split("\n");
                    if (newLines.length <= maxLines) {
                        onChange(property.name, data.value);
                    }
                }}
            />
            <div className="field-hint">
                Строк: {lines.length} / {maxLines}
                {validation?.maxLineLength && <> | Макс. длина строки: {validation.maxLineLength}</>}
            </div>
        </Form.Field>
    );
}

export function PropertyField(props: PropertyFieldProps) {
    const { property, value, onDelete } = props;
    const isDeleted = value === null;
    const hasValue = value !== undefined && value !== null && value !== "";

    const inner = (() => {
        switch (property.type) {
            case "bool":   return <BoolField {...props} />;
            case "number": return <NumberField {...props} />;
            case "string": return <StringField {...props} />;
            case "text":   return <TextField {...props} />;
            default:       return <StringField {...props} />;
        }
    })();

    if (!onDelete) return inner;

    return (
        <div className="property-field">
            <div className="property-field-row">
                <div className="property-field-input">{inner}</div>
                {!isDeleted && hasValue && (
                    <Popup
                        trigger={
                            <Button
                                icon="trash alternate outline"
                                size="small"
                                basic
                                className="property-field-delete"
                                onClick={() => onDelete(property.name)}
                            />
                        }
                        content="Удалить значение свойства (null)"
                        size="mini"
                        position="top right"
                    />
                )}
            </div>
            {isDeleted && (
                <div className="field-hint" style={{ color: "var(--muted-text-color, rgba(0,0,0,0.5))" }}>
                    Значение удалено (будет отправлено null)
                </div>
            )}
        </div>
    );
}
