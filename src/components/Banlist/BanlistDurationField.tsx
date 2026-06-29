import React from "react";
import { Dropdown, Input } from "semantic-ui-react";
import { DurationUnit, DurationUnitOption } from "../../utils/BanlistTemplateDraft";
import "./BanlistDurationField.scss";

interface BanlistDurationFieldProps {
    value: string;
    unit: DurationUnit;
    options: DurationUnitOption[];
    onValueChange: (value: string) => void;
    onUnitChange: (unit: DurationUnit) => void;
    disabled?: boolean;
    // подсказка-плейсхолдер для режима ISO 8601
    isoPlaceholder?: string;
    // тянуть выпадашку единиц на всю доступную ширину (узкие модалки)
    fillUnit?: boolean;
    // ширина поля значения; по умолчанию задаётся в scss
    valueWidth?: string;
    // подпись после выпадашки, в той же строке
    suffix?: React.ReactNode;
    // дополнительные классы корневого контейнера (например, отступ)
    className?: string;
}

// Поле длительности: число + единица измерения (минуты/часы/дни/ISO 8601).
// В режиме ISO ввод текстовый, иначе числовой. Преобразование значения в секунды —
// на стороне вызывающего кода через buildDurationPayload/secondsToDuration.
function BanlistDurationField(props: BanlistDurationFieldProps) {
    const {
        value,
        unit,
        options,
        onValueChange,
        onUnitChange,
        disabled,
        isoPlaceholder = "P1D, PT2H...",
        fillUnit,
        valueWidth,
        suffix,
        className,
    } = props;

    const rootClassName = [
        "banlist-duration-field",
        fillUnit ? "banlist-duration-field--fill" : "",
        className || "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={rootClassName}>
            <Input
                className="banlist-duration-field__value"
                disabled={disabled}
                onChange={(_, data) => onValueChange(data.value)}
                placeholder={unit === "iso" ? isoPlaceholder : ""}
                style={valueWidth ? { width: valueWidth } : undefined}
                type={unit === "iso" ? "text" : "number"}
                value={value}
            />
            <Dropdown
                className="banlist-duration-field__unit"
                onChange={(_, data) => onUnitChange(data.value as DurationUnit)}
                options={options}
                selection
                value={unit}
            />
            {suffix !== undefined && (
                <span className="banlist-duration-field__suffix">{suffix}</span>
            )}
        </div>
    );
}

export default BanlistDurationField;
