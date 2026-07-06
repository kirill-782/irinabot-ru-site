import React, { useContext, useMemo, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import { Button, Form, Header, Message, Segment } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import {
    AdminListOutWeb,
    AdminListTemplateInWeb,
    AdminListTemplateOutWeb,
    AdminListTemplateRoleWeb,
} from "../../models/rest/AdminList";
import { AdminListService } from "../../services/AdminListService";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import { NormalizedValueChangeType } from "../../utils/AdminListUtils";
import { useRoleDrafts } from "../../hooks/useRoleDrafts";
import AdminListRolesTable from "./AdminListRolesTable";
import { RoleRow } from "./interfaces";

interface AdminListTemplateEditorProps {
    listId: number;
    list: AdminListOutWeb;
    adminListApi: AdminListService;
    // редактируемый шаблон; null — создание нового
    template: AdminListTemplateOutWeb | null;
    onClose: (reload?: boolean) => void | Promise<void>;
}

function AdminListTemplateEditor(props: AdminListTemplateEditorProps) {
    const { listId, list, adminListApi, template, onClose } = props;
    const isEdit = !!template;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    // Шаблон хранит булево значение роли (true — грант, false — снятие), поэтому редактор
    // всегда использует SET-контрол (запретить/сбросить/разрешить) независимо от режима списка.
    const listMode: NormalizedValueChangeType = "SET";
    const listPrivilegeLevel =
        typeof list.privilegeLevel === "number" ? list.privilegeLevel : null;

    const [name, setName] = useState(template?.name || "");
    const [description, setDescription] = useState(template?.description || "");
    const [privilegeDraft, setPrivilegeDraft] = useState(
        template?.privilegeLevel != null ? String(template.privilegeLevel) : ""
    );
    const [isSubmitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Значение роли в исходном шаблоне (baseline для подсветки изменений в таблице).
    const templateRoleValue = useMemo(() => {
        const map = new Map<string, boolean>();
        (template?.roles || []).forEach((role) => {
            if (role.name) map.set(role.name, role.value);
        });
        return map;
    }, [template]);

    // Строки ролей строим из declared-ролей списка. value = состояние в шаблоне.
    const roleRows = useMemo<RoleRow[]>(() => {
        return (list.roles || [])
            .filter((role) => role.declared && role.name)
            .map<RoleRow>((role) => {
                const roleName = role.name || "";

                return {
                    name: roleName,
                    declared: true,
                    owned: !!role.owned,
                    grantedBy: null,
                    activeBefore: null,
                    value: templateRoleValue.has(roleName)
                        ? (templateRoleValue.get(roleName) as boolean)
                        : null,
                };
            })
            .sort((left, right) => left.name.localeCompare(right.name, "ru"));
    }, [list.roles, templateRoleValue]);

    const { roleDrafts, handleDraftChange, handleResetRow, handleMarkForDeletion } =
        useRoleDrafts(roleRows);

    // В шаблоне нет пользователя — редактировать можно только собственные (owned) роли.
    const getRoleRestriction = (role: RoleRow) =>
        role.owned ? "" : t("adminListTemplateRestrictionNotOwned");

    // Роль входит в шаблон: MAX — только явный allow (true); SET — allow или deny.
    const buildRoles = (): AdminListTemplateRoleWeb[] => {
        const roles: AdminListTemplateRoleWeb[] = [];

        roleRows.forEach((role) => {
            const draft = roleDrafts[role.name];
            const value = draft ? draft.value : role.value;

            // в шаблон входит роль с явным значением: allow (true) или deny (false)
            if (value === true || value === false) {
                roles.push({ name: role.name, value });
            }
        });

        return roles;
    };

    const parsedPrivilege = privilegeDraft.trim() ? Number(privilegeDraft) : null;
    const privilegeHasError =
        parsedPrivilege !== null && (!Number.isInteger(parsedPrivilege) || parsedPrivilege < 1);
    const privilegeTooHigh =
        parsedPrivilege !== null &&
        !privilegeHasError &&
        listPrivilegeLevel !== null &&
        parsedPrivilege >= listPrivilegeLevel;

    const handleSubmit = async () => {
        setErrorMessage("");

        if (!name.trim()) {
            setErrorMessage(t("adminListTemplateEditorNameRequired"));
            return;
        }

        if (parsedPrivilege === null) {
            setErrorMessage(t("adminListTemplateEditorPrivilegeRequired"));
            return;
        }

        if (privilegeHasError) {
            setErrorMessage(t("adminListTemplateEditorPrivilegeError"));
            return;
        }

        const roles = buildRoles();

        if (roles.length === 0) {
            setErrorMessage(t("adminListTemplateEditorRolesRequired"));
            return;
        }

        const payload: AdminListTemplateInWeb = {
            name: name.trim(),
            description: description.trim() || null,
            roles,
            privilegeLevel: parsedPrivilege,
        };

        setSubmitting(true);

        try {
            if (isEdit && template?.id !== undefined) {
                await adminListApi.putAdminListTemplate(listId, template.id, payload);
                toast({ title: t("adminListTemplateUpdatedToast"), type: "success" });
            } else {
                await adminListApi.createAdminListTemplate(listId, payload);
                toast({ title: t("adminListTemplateCreatedToast"), type: "success" });
            }
        } catch (error) {
            setErrorMessage(convertErrorResponseToString(error));
            return;
        } finally {
            setSubmitting(false);
        }

        await onClose(true);
    };

    return (
        <div className="admin-list-template-editor">
            <div className="form-header">
                <Header as="h3">
                    {isEdit
                        ? t("adminListTemplateEditorEditHeader")
                        : t("adminListTemplateEditorNewHeader")}
                </Header>
                <div>
                    <Button onClick={() => void onClose()} type="button">
                        {t("cancel")}
                    </Button>
                    <Button
                        loading={isSubmitting}
                        onClick={() => void handleSubmit()}
                        primary
                        type="button"
                    >
                        {isEdit ? t("save") : t("create")}
                    </Button>
                </div>
            </div>

            {errorMessage && <Message error>{errorMessage}</Message>}

            <Segment>
                <Form>
                    <Form.Group widths="equal">
                        <Form.Input
                            label={t("adminListTemplateEditorNameLabel")}
                            onChange={(_, data) => setName(data.value)}
                            placeholder={t("adminListTemplateEditorNamePlaceholder")}
                            value={name}
                        />
                        <Form.Input
                            error={privilegeHasError}
                            label={t("adminListTemplateEditorPrivilegeLabel")}
                            min={1}
                            onChange={(_, data) => setPrivilegeDraft((data.value as string) || "")}
                            placeholder={t("adminListTemplateEditorPrivilegePlaceholder")}
                            required
                            step={1}
                            type="number"
                            value={privilegeDraft}
                        />
                    </Form.Group>
                    <Form.TextArea
                        label={t("adminListTemplateEditorDescriptionLabel")}
                        onChange={(_, data) => setDescription(String(data.value || ""))}
                        placeholder={t("adminListTemplateEditorDescriptionPlaceholder")}
                        rows={2}
                        value={description}
                    />
                    {privilegeTooHigh && (
                        <Message warning size="tiny">
                            {t("adminListTemplateEditorPrivilegeTooHigh", {
                                level: String(listPrivilegeLevel),
                            })}
                        </Message>
                    )}
                </Form>
            </Segment>

            <Segment>
                <Header as="h4">
                    {t("adminListTemplateEditorRolesHeader")}
                    <Header.Subheader>
                        {t("adminListTemplateEditorRolesHint")}
                    </Header.Subheader>
                </Header>

                {roleRows.length === 0 ? (
                    <Message info>{t("adminListTemplateEditorNoRoles")}</Message>
                ) : (
                    <AdminListRolesTable
                        roleRows={roleRows}
                        roleDrafts={roleDrafts}
                        listMode={listMode}
                        isApplyingChanges={isSubmitting}
                        templateMode
                        getRoleRestriction={getRoleRestriction}
                        getRoleDeleteRestriction={getRoleRestriction}
                        onDraftChange={handleDraftChange}
                        onResetRow={handleResetRow}
                        onMarkForDeletion={handleMarkForDeletion}
                    />
                )}
            </Segment>
        </div>
    );
}

export default AdminListTemplateEditor;
