import React from "react";
import { Table } from "semantic-ui-react";

export interface ReplayField {
    label: string;
    value: React.ReactNode;
    /** Поле не показывается, если значение пустое — реплеи разных версий заполняют не всё. */
    hideWhenEmpty?: boolean;
}

interface ReplayFieldTableProps {
    fields: ReplayField[];
}

// false попадает сюда из выражений вида `flag && <X/>` — для таблицы это тоже «нет значения».
const isEmpty = (value: React.ReactNode) =>
    value === undefined || value === null || value === "" || value === false;

// Двухколоночная таблица «название — значение» для панелей реплея.
function ReplayFieldTable({ fields }: ReplayFieldTableProps) {
    const visibleFields = fields.filter((field) => !field.hideWhenEmpty || !isEmpty(field.value));

    return (
        <Table basic="very" compact="very" unstackable className="replay-field-table">
            <Table.Body>
                {visibleFields.map((field) => (
                    <Table.Row key={field.label}>
                        <Table.Cell collapsing className="field-label">
                            {field.label}
                        </Table.Cell>
                        <Table.Cell>{isEmpty(field.value) ? "—" : field.value}</Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
}

export default ReplayFieldTable;
