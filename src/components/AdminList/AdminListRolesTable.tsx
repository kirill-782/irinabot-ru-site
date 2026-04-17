import React, { useContext } from "react";
import { Button, Form, Label, Table } from "semantic-ui-react";
import ValueChangeControl from "../AdminList/ValueChangeControl";
import {
    fromDateTimeLocalInputValue,
    NormalizedValueChangeType,
    toDateTimeLocalInputValue,
} from "../../utils/AdminListUtils";
import { AppRuntimeSettingsContext } from "../../context";
import UserIdLabel from "./UserIdLabel";
import { RoleDraft, RoleRow } from "./interfaces";

interface AdminListRolesTableProps {
    roleRows: RoleRow[];
    roleDrafts: Record<string, RoleDraft>;
    listMode: NormalizedValueChangeType;
    isApplyingChanges: boolean;
    showDeclaredLabel?: boolean;
    useNumericValue?: boolean;
    getRoleRestriction: (role: RoleRow) => string;
    getRoleDeleteRestriction: (role: RoleRow) => string;
    onDraftChange: (roleName: string, next: RoleDraft) => void;
    onResetRow: (roleName: string) => void;
    onMarkForDeletion: (role: RoleRow) => void;
}

const getDraft = (role: RoleRow, drafts: Record<string, RoleDraft>): RoleDraft => {
    return (
        drafts[role.name] || {
            activeBefore: toDateTimeLocalInputValue(role.activeBefore),
            value: role.value ?? null,
        }
    );
};

const AdminListRolesTable: React.FC<AdminListRolesTableProps> = ({
    roleRows,
    roleDrafts,
    listMode,
    isApplyingChanges,
    showDeclaredLabel,
    useNumericValue,
    getRoleRestriction,
    getRoleDeleteRestriction,
    onDraftChange,
    onResetRow,
    onMarkForDeletion,
}) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    return (
        <div className="table-scroll">
            <Table celled className="roles-table" compact unstackable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell className="access-cell" width={3} />
                        <Table.HeaderCell width={4}>{t("adminListRolesColumnRole")}</Table.HeaderCell>
                        <Table.HeaderCell width={4}>{t("adminListRolesColumnExpiry")}</Table.HeaderCell>
                        <Table.HeaderCell width={3}>{t("adminListRolesColumnOwner")}</Table.HeaderCell>
                        <Table.HeaderCell className="actions-cell" width={2}>
                            {t("actions")}
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {roleRows.map((role) => {
                        const draft = getDraft(role, roleDrafts);
                        const editRestriction = getRoleRestriction(role);
                        const deleteRestriction = getRoleDeleteRestriction(role);
                        const normalizedDraftDate =
                            draft.value === null ? null : fromDateTimeLocalInputValue(draft.activeBefore);
                        const normalizedRoleDate =
                            role.value === null
                                ? null
                                : fromDateTimeLocalInputValue(toDateTimeLocalInputValue(role.activeBefore));
                        const hasRoleChanges =
                            draft.value !== (role.value ?? null) ||
                            normalizedDraftDate !== normalizedRoleDate;
                        const isExpired =
                            role.value !== null &&
                            role.activeBefore !== null &&
                            new Date(role.activeBefore) < new Date();

                        return (
                            <Table.Row key={role.name} active={hasRoleChanges} warning={isExpired && !hasRoleChanges}>
                                <Table.Cell className="access-cell" collapsing>
                                    {useNumericValue ? (
                                        <Form.Input
                                            disabled={!!editRestriction || isApplyingChanges}
                                            onChange={(_, data) => {
                                                const raw = (data.value as string) ?? "";
                                                const parsed = raw === "" ? null : Number(raw);
                                                const nextValue =
                                                    parsed === null || Number.isNaN(parsed) ? null : parsed;

                                                onDraftChange(role.name, {
                                                    activeBefore:
                                                        nextValue === null
                                                            ? ""
                                                            : draft.activeBefore ||
                                                              toDateTimeLocalInputValue(role.activeBefore),
                                                    value: nextValue,
                                                });
                                            }}
                                            type="number"
                                            value={
                                                typeof draft.value === "number"
                                                    ? String(draft.value)
                                                    : ""
                                            }
                                        />
                                    ) : (
                                        <ValueChangeControl
                                            disabled={!!editRestriction || isApplyingChanges}
                                            mode={listMode}
                                            onChange={(value) => {
                                                onDraftChange(role.name, {
                                                    activeBefore:
                                                        value === null
                                                            ? ""
                                                            : draft.activeBefore ||
                                                              toDateTimeLocalInputValue(role.activeBefore),
                                                    value,
                                                });
                                            }}
                                            value={draft.value}
                                        />
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="role-name">
                                        <strong>{role.name}</strong>
                                    </div>
                                    <div className="role-tags">
                                        {role.owned && (
                                            <Label basic size="mini">
                                                {t("adminListRoleLabelOwned")}
                                            </Label>
                                        )}
                                        {showDeclaredLabel && role.declared && (
                                            <Label basic size="mini">
                                                {t("adminListRoleLabelDeclared")}
                                            </Label>
                                        )}
                                        {isExpired && (
                                            <Label color="orange" size="mini">
                                                {t("adminListRoleLabelExpired")}
                                            </Label>
                                        )}
                                    </div>
                                    {editRestriction && (
                                        <div className="hint">{editRestriction}</div>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="date-cell">
                                        <Form.Input
                                            className="date-input"
                                            disabled={
                                                !!editRestriction || draft.value === null || isApplyingChanges
                                            }
                                            onChange={(_, data) => {
                                                onDraftChange(role.name, {
                                                    ...draft,
                                                    activeBefore: (data.value as string) || "",
                                                });
                                            }}
                                            type="datetime-local"
                                            value={draft.activeBefore}
                                        />
                                        {draft.value !== null && !draft.activeBefore ? (
                                            <Label basic size="mini">
                                                {t("adminListRoleLabelIndefinite")}
                                            </Label>
                                        ) : (
                                            <Button
                                                basic
                                                disabled={
                                                    !!editRestriction ||
                                                    draft.value === null ||
                                                    isApplyingChanges ||
                                                    !draft.activeBefore
                                                }
                                                onClick={() => {
                                                    onDraftChange(role.name, {
                                                        ...draft,
                                                        activeBefore: "",
                                                    });
                                                }}
                                                size="mini"
                                                title={t("adminListRoleButtonIndefiniteTitle")}
                                                type="button"
                                            >
                                                {t("adminListRoleLabelIndefinite")}
                                            </Button>
                                        )}
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    {role.grantedBy ? <UserIdLabel userId={role.grantedBy} /> : "—"}
                                </Table.Cell>
                                <Table.Cell className="actions-cell" collapsing>
                                    <div className="row-actions">
                                        <Button
                                            basic
                                            color="red"
                                            disabled={!!deleteRestriction || isApplyingChanges}
                                            icon="trash"
                                            onClick={() => onMarkForDeletion(role)}
                                            size="mini"
                                            title={deleteRestriction || t("adminListRoleButtonMarkDelete")}
                                            type="button"
                                        />
                                        {hasRoleChanges && (
                                            <Button
                                                basic
                                                disabled={isApplyingChanges}
                                                icon="undo"
                                                onClick={() => onResetRow(role.name)}
                                                size="mini"
                                                title={t("adminListRoleButtonResetChange")}
                                                type="button"
                                            />
                                        )}
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>
        </div>
    );
};

export default AdminListRolesTable;
