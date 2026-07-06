import React, { useContext, useMemo, useState } from "react";
import { Button, Form, Icon, Input, Label, Message, Table } from "semantic-ui-react";
import ValueChangeControl from "../AdminList/ValueChangeControl";
import {
    fromDateTimeLocalInputValue,
    NormalizedValueChangeType,
    parseAdminListDateValue,
    resolveAdminListRoleDescription,
    resolveAdminListRoleTitle,
    toDateTimeLocalInputValue,
} from "../../utils/AdminListUtils";
import {
    COMMAND_GROUP_ORDER,
    getCommandPermissions,
    getRoleHierarchy,
    isCommandRole,
    isPermissionRole,
    OTHER_GROUP_KEY,
    PERMISSION_GROUP_ORDER,
} from "../../utils/adminListRoleModel";
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
    // режим редактора шаблона: нет пользователя → колонки «Срок» и «Владелец» скрыты
    templateMode?: boolean;
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

const byRoleName = (left: RoleRow, right: RoleRow) => left.name.localeCompare(right.name, "ru");

const AdminListRolesTable: React.FC<AdminListRolesTableProps> = ({
    roleRows,
    roleDrafts,
    listMode,
    isApplyingChanges,
    showDeclaredLabel,
    useNumericValue,
    templateMode,
    getRoleRestriction,
    getRoleDeleteRestriction,
    onDraftChange,
    onResetRow,
    onMarkForDeletion,
}) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    // Колонок в таблице: обычно 5 (доступ, роль, срок, владелец, действия);
    // в режиме шаблона остаются только «доступ» + «роль» (срок/владелец/действия скрыты) → 2.
    const COLUMN_COUNT = templateMode ? 2 : 5;

    // По умолчанию блок команд (вспомогательный) свёрнут.
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const toggleGroup = (key: string) =>
        setExpandedGroups((current) => ({ ...current, [key]: !current[key] }));

    // Поиск по ролям: учитывает заголовок, описание и само имя роли.
    const [query, setQuery] = useState("");
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = (role: RoleRow) => {
        if (!normalizedQuery) return true;

        const haystack = [
            resolveAdminListRoleTitle(role.name, t),
            resolveAdminListRoleDescription(role.name, t),
            role.name,
        ]
            .join(" ")
            .toLowerCase();

        return haystack.includes(normalizedQuery);
    };

    // Разбор ролей на права (основные) и команды (вспомогательные).
    const { permissionOrder, commandGroups } = useMemo(() => {
        const permissionMap = new Map(roleRows.filter((role) => isPermissionRole(role.name)).map((role) => [role.name, role]));
        const usedPermissions = new Set<string>();
        const orderedPermissions: { role: RoleRow; chainChild: boolean }[] = [];

        PERMISSION_GROUP_ORDER.forEach((startName) => {
            const chain = getRoleHierarchy(startName);

            if (chain) {
                const present = chain.filter((name) => permissionMap.has(name));

                present.forEach((name, index) => {
                    usedPermissions.add(name);
                    orderedPermissions.push({ role: permissionMap.get(name)!, chainChild: index > 0 });
                });
            } else if (permissionMap.has(startName)) {
                usedPermissions.add(startName);
                orderedPermissions.push({ role: permissionMap.get(startName)!, chainChild: false });
            }
        });

        // права, не описанные в словаре, не теряем
        roleRows
            .filter((role) => isPermissionRole(role.name) && !usedPermissions.has(role.name))
            .sort(byRoleName)
            .forEach((role) => orderedPermissions.push({ role, chainChild: false }));

        // команды группируем по управляющему праву; команда с двумя правами попадает
        // в обе группы; неизвестные — в «Прочее»
        const groups = new Map<string, RoleRow[]>();
        roleRows.forEach((role) => {
            if (isPermissionRole(role.name)) return;

            const permissions = isCommandRole(role.name) ? getCommandPermissions(role.name) : [];
            const keys = permissions.length > 0 ? permissions : [OTHER_GROUP_KEY];

            keys.forEach((key) => {
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push(role);
            });
        });

        const orderedGroupKeys = [
            ...COMMAND_GROUP_ORDER.filter((key) => groups.has(key)),
            ...[...groups.keys()].filter((key) => !COMMAND_GROUP_ORDER.includes(key)),
        ];

        const orderedGroups = orderedGroupKeys.map((key) => ({
            key,
            label: key === OTHER_GROUP_KEY ? t("adminListRolesGroupOther") : resolveAdminListRoleTitle(key, t),
            rows: groups.get(key)!.slice().sort(byRoleName),
        }));

        return { permissionOrder: orderedPermissions, commandGroups: orderedGroups };
    }, [roleRows, t]);

    // «Выдано» с точки зрения массовых операций (MAX-режим: true; SET/числа: > 0).
    const isGranted = (value: boolean | number | null) =>
        value === true || (typeof value === "number" && value > 0);

    // Сводное значение группы команд по черновикам (для контрола «выделить все»).
    const getGroupBulk = (rows: RoleRow[]) => {
        const editable = rows.filter((role) => !getRoleRestriction(role));
        const values = editable.map((role) => getDraft(role, roleDrafts).value);
        const aggregate: boolean | number | null =
            editable.length === 0
                ? null
                : values.every(isGranted)
                ? true
                : values.every((value) => value === false)
                ? false
                : null;

        return { editable, aggregate };
    };

    // Применить значение ко всем редактируемым командам группы (массовое выделение).
    const applyGroupValue = (rows: RoleRow[], value: boolean | number | null) => {
        rows.forEach((role) => {
            if (getRoleRestriction(role)) return;

            const draft = getDraft(role, roleDrafts);

            onDraftChange(role.name, {
                value,
                activeBefore:
                    value === null
                        ? ""
                        : draft.activeBefore || toDateTimeLocalInputValue(role.activeBefore),
            });
        });
    };

    // Все команды (вспомогательные роли) с учётом поиска и доступные среди них.
    const allCommandRows = roleRows.filter((role) => !isPermissionRole(role.name) && matchesQuery(role));
    const availableCommandRows = allCommandRows.filter((role) => !getRoleRestriction(role));

    const roleByName = new Map(roleRows.map((role) => [role.name, role]));

    // Проставить всем выданным командам группы срок (activeBefore), как у самого права
    // (группирующей роли) — чтобы не вводить дату вручную каждой команде.
    const fillGroupDatesFromRole = (permissionName: string, rows: RoleRow[]) => {
        const permissionRole = roleByName.get(permissionName);

        if (!permissionRole) return;

        const date = getDraft(permissionRole, roleDrafts).activeBefore;

        rows.forEach((role) => {
            if (getRoleRestriction(role)) return;

            const draft = getDraft(role, roleDrafts);

            // срок имеет смысл только для выданных команд
            if (draft.value === null) return;

            onDraftChange(role.name, { ...draft, activeBefore: date });
        });
    };

    // Выбрать/снять все доступные команды. «Снять» = сброс записи (null), чтобы не
    // плодить лишние изменения у команд, которые и так не выданы, и чтобы выбор →
    // снятие возвращало к исходному состоянию. Команды, уже находящиеся в нужном
    // состоянии, не трогаем.
    const applyCommandSelection = (grant: boolean) => {
        availableCommandRows.forEach((role) => {
            const draft = getDraft(role, roleDrafts);

            if (isGranted(draft.value) === grant) return;

            const value: boolean | null = grant ? true : null;

            onDraftChange(role.name, {
                value,
                activeBefore:
                    value === null
                        ? ""
                        : draft.activeBefore || toDateTimeLocalInputValue(role.activeBefore),
            });
        });
    };

    const renderRoleRow = (role: RoleRow, rowClassName?: string, rowKey?: string) => {
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
            draft.value !== (role.value ?? null) || normalizedDraftDate !== normalizedRoleDate;
        const roleExpiry = parseAdminListDateValue(role.activeBefore);
        const isExpired =
            role.value !== null && roleExpiry !== null && roleExpiry.getTime() < Date.now();
        const roleTitle = resolveAdminListRoleTitle(role.name, t);
        const roleDescription = resolveAdminListRoleDescription(role.name, t);
        // роль входит в шаблон: MAX — только allow (true); SET — allow или deny (не null)
        const templateIncluded =
            listMode === "MAX" ? draft.value === true : draft.value !== null;

        return (
            <Table.Row
                key={rowKey ?? role.name}
                className={rowClassName}
                active={!templateMode && hasRoleChanges}
                positive={templateMode && templateIncluded}
                warning={!templateMode && isExpired && !hasRoleChanges}
            >
                <Table.Cell className="access-cell" collapsing>
                    {useNumericValue ? (
                        <Form.Input
                            disabled={!!editRestriction || isApplyingChanges}
                            onChange={(_, data) => {
                                const raw = (data.value as string) ?? "";
                                const parsed = raw === "" ? null : Number(raw);
                                const nextValue = parsed === null || Number.isNaN(parsed) ? null : parsed;

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
                            value={typeof draft.value === "number" ? String(draft.value) : ""}
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
                        <strong
                            title={roleDescription || undefined}
                            style={roleDescription ? { cursor: "help" } : undefined}
                        >
                            {roleTitle}
                        </strong>
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
                    {editRestriction && <div className="hint">{editRestriction}</div>}
                </Table.Cell>
                {!templateMode && (
                    <Table.Cell>
                        <div className="date-cell">
                            <Form.Input
                                className="date-input"
                                disabled={!!editRestriction || draft.value === null || isApplyingChanges}
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
                                        onDraftChange(role.name, { ...draft, activeBefore: "" });
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
                )}
                {!templateMode && (
                    <Table.Cell>
                        {role.grantedBy ? <UserIdLabel userId={role.grantedBy} /> : "—"}
                    </Table.Cell>
                )}
                {!templateMode && (
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
                )}
            </Table.Row>
        );
    };

    const filteredPermissionOrder = normalizedQuery
        ? permissionOrder.filter((entry) => matchesQuery(entry.role))
        : permissionOrder;
    const filteredCommandGroups = normalizedQuery
        ? commandGroups
              .map((group) => ({ ...group, rows: group.rows.filter(matchesQuery) }))
              .filter((group) => group.rows.length > 0)
        : commandGroups;
    const hasAnyMatch = filteredPermissionOrder.length > 0 || filteredCommandGroups.length > 0;

    return (
        <>
            <Input
                className="roles-search"
                fluid
                icon="search"
                iconPosition="left"
                placeholder={t("adminListRolesSearchPlaceholder")}
                value={query}
                onChange={(_, data) => setQuery(data.value)}
            />
            <div className="table-scroll">
            <Table celled className="roles-table" compact unstackable>
                <Table.Header>
                    <Table.Row>
                        {templateMode ? (
                            <Table.HeaderCell className="access-cell" width={2}>
                                {t("adminListTemplateEditorRolesInclude")}
                            </Table.HeaderCell>
                        ) : (
                            <Table.HeaderCell className="access-cell" width={3} />
                        )}
                        <Table.HeaderCell width={templateMode ? 14 : 4}>
                            {t("adminListRolesColumnRole")}
                        </Table.HeaderCell>
                        {!templateMode && (
                            <Table.HeaderCell width={4}>{t("adminListRolesColumnExpiry")}</Table.HeaderCell>
                        )}
                        {!templateMode && (
                            <Table.HeaderCell width={3}>{t("adminListRolesColumnOwner")}</Table.HeaderCell>
                        )}
                        {!templateMode && (
                            <Table.HeaderCell className="actions-cell" width={2}>
                                {t("actions")}
                            </Table.HeaderCell>
                        )}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {filteredPermissionOrder.length > 0 && (
                        <Table.Row className="roles-section-header">
                            <Table.Cell colSpan={COLUMN_COUNT}>
                                <span className="roles-section-title">
                                    {t("adminListRolesSectionPermissions")}
                                </span>
                                <span className="roles-section-hint">{t("adminListRolesHierarchyHint")}</span>
                            </Table.Cell>
                        </Table.Row>
                    )}
                    {filteredPermissionOrder.map(({ role, chainChild }) =>
                        renderRoleRow(role, chainChild ? "role-chain-child" : undefined)
                    )}

                    {filteredCommandGroups.length > 0 && (
                        <Table.Row className="roles-section-header">
                            <Table.Cell colSpan={COLUMN_COUNT}>
                                <div className="roles-section-bar">
                                    <div>
                                        <span className="roles-section-title">
                                            {t("adminListRolesSectionCommands")}
                                        </span>
                                        <span className="roles-section-hint">
                                            {t("adminListRolesCommandsNote")}
                                        </span>
                                    </div>
                                    {!useNumericValue && (
                                        <div className="roles-section-actions">
                                            <Button
                                                basic
                                                size="mini"
                                                type="button"
                                                disabled={isApplyingChanges || availableCommandRows.length === 0}
                                                title={t("adminListRolesBulkAvailableHint")}
                                                onClick={() => applyCommandSelection(true)}
                                            >
                                                {t("adminListRolesSelectAll")}
                                            </Button>
                                            <Button
                                                basic
                                                size="mini"
                                                type="button"
                                                disabled={isApplyingChanges || availableCommandRows.length === 0}
                                                title={t("adminListRolesBulkAvailableHint")}
                                                onClick={() => applyCommandSelection(false)}
                                            >
                                                {t("adminListRolesDeselectAll")}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    )}
                    {filteredCommandGroups.map((group) => {
                        const expanded = normalizedQuery ? true : !!expandedGroups[group.key];
                        const { editable, aggregate } = getGroupBulk(group.rows);
                        const grantedEditableCount = group.rows.filter(
                            (role) => !getRoleRestriction(role) && getDraft(role, roleDrafts).value !== null
                        ).length;
                        const canFillDate =
                            !templateMode && !useNumericValue && roleByName.has(group.key);

                        return (
                            <React.Fragment key={`group-${group.key}`}>
                                <Table.Row className="roles-group-header">
                                    <Table.Cell
                                        className="access-cell"
                                        collapsing
                                        title={t("adminListRolesGroupSelectAll")}
                                    >
                                        {!useNumericValue && (
                                            <ValueChangeControl
                                                disabled={isApplyingChanges || editable.length === 0}
                                                mode={listMode}
                                                value={aggregate}
                                                onChange={(value) => applyGroupValue(group.rows, value)}
                                            />
                                        )}
                                    </Table.Cell>
                                    <Table.Cell
                                        className="roles-group-toggle"
                                        colSpan={COLUMN_COUNT - 1}
                                        onClick={() => toggleGroup(group.key)}
                                    >
                                        <div className="roles-group-toggle-inner">
                                            <span className="roles-group-label">
                                                <Icon name={expanded ? "caret down" : "caret right"} />
                                                {group.label}
                                                <Label circular size="tiny">
                                                    {group.rows.length}
                                                </Label>
                                            </span>
                                            {canFillDate && (
                                                <Button
                                                    basic
                                                    size="mini"
                                                    type="button"
                                                    icon="calendar alternate outline"
                                                    content={t("adminListRolesGroupFillDate")}
                                                    title={t("adminListRolesGroupFillDateHint")}
                                                    disabled={isApplyingChanges || grantedEditableCount === 0}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        fillGroupDatesFromRole(group.key, group.rows);
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                                {expanded &&
                                    group.rows.map((role) =>
                                        renderRoleRow(role, undefined, `${group.key}:${role.name}`)
                                    )}
                            </React.Fragment>
                        );
                    })}

                    {normalizedQuery && !hasAnyMatch && (
                        <Table.Row>
                            <Table.Cell colSpan={COLUMN_COUNT}>
                                <Message info size="small">
                                    {t("adminListRolesSearchNoResults")}
                                </Message>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
            </div>
        </>
    );
};

export default AdminListRolesTable;
