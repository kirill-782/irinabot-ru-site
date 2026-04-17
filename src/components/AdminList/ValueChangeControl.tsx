import React, { useContext } from "react";
import { Button, Checkbox, Icon } from "semantic-ui-react";
import { NormalizedValueChangeType } from "../../utils/AdminListUtils";
import { AppRuntimeSettingsContext } from "../../context";

import "./ValueChangeControl.scss";

export interface ValueChangeControlProps {
    disabled?: boolean;
    mode: NormalizedValueChangeType;
    onChange: (value: boolean | number | null) => void;
    value: boolean | number | null;
}

function ValueChangeControl({ disabled, mode, onChange, value }: ValueChangeControlProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    if (mode === "MAX") {
        return (
            <div className="admin-list-value-control max">
                <Checkbox
                    checked={value === true}
                    disabled={disabled}
                    onChange={(_, data) => {
                        onChange(data.checked ? true : 0);
                    }}
                />
            </div>
        );
    }

    return (
        <Button.Group className="admin-list-value-control set" size="mini">
            <Button
                aria-label={t("adminListControlDeny")}
                basic={value !== false}
                color={value === false ? "red" : undefined}
                disabled={disabled}
                icon
                onClick={() => {
                    onChange(false);
                }}
                title={t("adminListControlDeny")}
                type="button"
            >
                <Icon name="close" />
            </Button>
            <Button
                aria-label={t("adminListControlReset")}
                basic={value !== null}
                className="neutral"
                disabled={disabled}
                onClick={() => {
                    onChange(null);
                }}
                title={t("adminListControlReset")}
                type="button"
            >
                /
            </Button>
            <Button
                aria-label={t("adminListControlAllow")}
                basic={value !== true}
                color={value === true ? "green" : undefined}
                disabled={disabled}
                icon
                onClick={() => {
                    onChange(true);
                }}
                title={t("adminListControlAllow")}
                type="button"
            >
                <Icon name="check" />
            </Button>
        </Button.Group>
    );
}

export default ValueChangeControl;
