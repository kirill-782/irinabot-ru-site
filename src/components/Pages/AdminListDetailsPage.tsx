import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@kokomi/react-semantic-toasts";
import {
    Button,
    Container,
    Form,
    Grid,
    Header,
    Icon,
    Label,
    List,
    Loader,
    Message,
    Segment,
} from "semantic-ui-react";
import AdminListCard from "../AdminList/AdminListCard";
import AdminListEditForm from "../AdminList/AdminListEditForm";
import AdminListRolesTable from "../AdminList/AdminListRolesTable";
import AdminListUserSidebar from "../AdminList/AdminListUserSidebar";
import UserIdLabel from "../AdminList/UserIdLabel";
import { PendingChange, RoleRow } from "../AdminList/interfaces";
import MetaRobots from "../Meta/MetaRobots";
import { AppRuntimeSettingsContext, AuthContext, RestContext } from "../../context";
import { useConfirmModal } from "../../hooks/useConfirmModal";
import { useTitle } from "../../hooks/useTitle";
import { useAdminList } from "../../hooks/useAdminList";
import { useAdminListUsers } from "../../hooks/useAdminListUsers";
import { useAdminListUser } from "../../hooks/useAdminListUser";
import { useAdminListEveryone } from "../../hooks/useAdminListEveryone";
import { useAdminListTemplates } from "../../hooks/useAdminListTemplates";
import { useResolveConnectorIds } from "../../hooks/useResolveConnectorIds";
import { useRoleDrafts } from "../../hooks/useRoleDrafts";
import {
    AdminListOutWebRole,
    AdminListPatchInWeb,
    AdminListRolePutInWeb,
    AdminListTemplateOutWeb,
    AdminListUserOutWebRole,
} from "../../models/rest/AdminList";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import {
    ADMIN_LIST_INSERT_ROLE,
    ADMIN_LIST_MANAGE_ROLE,
    EVERYONE_TARGET,
    formatAdminListDateValue,
    fromDateTimeLocalInputValue,
    hasOwnedListRole,
    isCurrentUserIdentifier,
    isCurrentUserOwner,
    normalizeAdminListValueChangeType,
    resolveAdminListRoleTitle,
    toDateTimeLocalInputValue,
} from "../../utils/AdminListUtils";
import { cascadeHierarchyDrafts } from "../../utils/adminListRoleModel";
import ApplyTemplateControl from "../AdminList/ApplyTemplateControl";
import Breadcrumbs from "../Breadcrumbs";

import "../AdminList/AdminListDetails.scss";

function AdminListDetailsPage() {
    const navigate = useNavigate();
    const params = useParams();
    const listId = Number(params.id);
    const { adminListApi } = useContext(RestContext);
    const auth = useContext(AuthContext).auth;
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    // Хлебные крошки: Списки / Список #N (на странице деталей #N — активный раздел).
    const listBreadcrumbItems = [
        { label: t("adminListBreadcrumbLists"), to: "/admin-list" },
        {
            label: Number.isFinite(listId)
                ? t("adminListOverviewCardHeader", { id: String(listId) })
                : undefined,
        },
    ];

    const { confirm, confirmModal } = useConfirmModal();

    const {
        data: listData,
        isLoading: isListLoading,
        errorMessage: listErrorMessage,
        reload: reloadList,
    } = useAdminList(listId);

    const {
        users,
        isLoading: isUsersLoading,
        errorMessage: usersErrorMessage,
        reload: reloadUsers,
    } = useAdminListUsers(listId);

    // Активный элемент (пользователь / «все пользователи») хранится в URL (?user=…),
    // чтобы ссылку можно было шарить.
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedUserId = searchParams.get("user") || "";
    const setSelectedUserId = useCallback(
        (userId: string) => {
            const next = new URLSearchParams(searchParams);

            if (userId) next.set("user", userId);
            else next.delete("user");

            setSearchParams(next, { replace: true });
        },
        [searchParams, setSearchParams]
    );

    const isEveryone = selectedUserId === EVERYONE_TARGET;

    const {
        data: userData,
        isLoading: isUserDataLoading,
        errorMessage: userDataError,
        reload: reloadUserData,
    } = useAdminListUser(listId, isEveryone ? "" : selectedUserId);

    const {
        data: everyoneData,
        isLoading: isEveryoneLoading,
        errorMessage: everyoneError,
        reload: reloadEveryone,
    } = useAdminListEveryone(listId, isEveryone);

    // Шаблоны выдачи ролей (клиентский модуль поверх /v1/admin-lists/{id}/templates).
    const { templates: adminListTemplates } = useAdminListTemplates(listId);
    const [isApplyingTemplate, setApplyingTemplate] = useState(false);

    const selectedUserData = isEveryone ? everyoneData : userData;
    const isUserLoading = isEveryone ? isEveryoneLoading : isUserDataLoading;
    const userErrorMessage = isEveryone ? everyoneError : userDataError;
    const reloadSelectedUser = isEveryone ? reloadEveryone : reloadUserData;

    const [privilegeDraft, setPrivilegeDraft] = useState("");
    const [bulkActiveBefore, setBulkActiveBefore] = useState("");

    const [isDeletingList, setDeletingList] = useState(false);
    const [isApplyingChanges, setApplyingChanges] = useState(false);
    const [isSavingPrivilege, setSavingPrivilege] = useState(false);
    const [isDeletingUser, setDeletingUser] = useState(false);
    const [isPendingExpanded, setPendingExpanded] = useState(false);
    const [isEditingList, setEditingList] = useState(false);
    const [isSavingList, setSavingList] = useState(false);

    useTitle(listData?.id ? `Admin list #${listData.id}` : "Admin list");

    const canManage = useMemo(() => {
        return hasOwnedListRole(listData?.roles, ADMIN_LIST_MANAGE_ROLE);
    }, [listData?.roles]);

    const canInsert = useMemo(() => {
        return canManage || hasOwnedListRole(listData?.roles, ADMIN_LIST_INSERT_ROLE);
    }, [canManage, listData?.roles]);

    const ownedAdminListRoles = useMemo(() => {
        return (listData?.roles || [])
            .filter((role) => role.owned && role.name)
            .map((role) => role.name || "")
            .sort((left, right) => left.localeCompare(right, "ru"));
    }, [listData?.roles]);

    useEffect(() => {
        if (!selectedUserId && users.length > 0) {
            setSelectedUserId(users[0].userId || "");
        }
    }, [selectedUserId, users]);

    const connectorIdsToResolve = useMemo(() => {
        const ids: Array<string | null | undefined> = [];

        users.forEach((user) => ids.push(user.userId));
        if (selectedUserId) ids.push(selectedUserId);
        (selectedUserData?.roles || []).forEach((role) => ids.push(role.grantedBy));
        if (listData?.owner) ids.push(listData.owner);

        return ids;
    }, [users, selectedUserId, selectedUserData?.roles, listData?.owner]);

    useResolveConnectorIds(connectorIdsToResolve);

    const listMode = normalizeAdminListValueChangeType(listData?.valueChangeType);
    const listPrivilegeLevel = typeof listData?.privilegeLevel === "number" ? listData.privilegeLevel : null;
    const selectedUserPrivilegeLevel =
        typeof selectedUserData?.privilegeLevel === "number" ? selectedUserData.privilegeLevel : null;
    const selectedUserHasZeroPrivilege = selectedUserPrivilegeLevel === 0;
    const strongerSelectedUser =
        listPrivilegeLevel !== null &&
        selectedUserPrivilegeLevel !== null &&
        selectedUserPrivilegeLevel > listPrivilegeLevel;
    const readOnlyMode = !isListLoading && (!canInsert || listPrivilegeLevel === null);
    const readOnlyReasons = useMemo(() => {
        const reasons: string[] = [];

        if (!canInsert) {
            reasons.push(t("adminListReadOnlyNoInsert"));
        }

        if (listPrivilegeLevel === null) {
            reasons.push(t("adminListReadOnlyNullPrivilege"));
        }

        return reasons;
    }, [canInsert, listPrivilegeLevel]);

    const roleRows = useMemo<RoleRow[]>(() => {
        const map = new Map<string, RoleRow>();

        (listData?.roles || []).forEach((role: AdminListOutWebRole) => {
            const name = role.name || "";

            if (!name) return;

            map.set(name, {
                activeBefore: null,
                declared: !!role.declared,
                grantedBy: null,
                name,
                owned: !!role.owned,
                value: null,
            });
        });

        (selectedUserData?.roles || []).forEach((role: AdminListUserOutWebRole) => {
            const name = role.name || "";

            if (!name) return;

            const currentRow = map.get(name);

            map.set(name, {
                activeBefore: role.activeBefore || currentRow?.activeBefore || null,
                declared: currentRow?.declared || false,
                grantedBy: role.grantedBy || null,
                name,
                owned: currentRow?.owned || false,
                value: role.value ?? null,
            });
        });

        return [...map.values()].sort((left, right) => left.name.localeCompare(right.name, "ru"));
    }, [listData?.roles, selectedUserData?.roles]);

    // Общий плюминг черновиков ролей (состояние, каскад иерархии, типовые операции).
    // roleRows строится выше по данным списка + пользователя; хук синхронизирует с ним черновики.
    const {
        roleDrafts,
        setRoleDrafts,
        presentRoleNames,
        roleByName,
        getDraft: getRoleDraft,
        handleDraftChange,
        handleResetRow,
        handleMarkForDeletion,
        resetDrafts,
    } = useRoleDrafts(roleRows);

    useEffect(() => {
        if (selectedUserData?.privilegeLevel != null && selectedUserData.privilegeLevel !== 0) {
            setPrivilegeDraft(selectedUserData.privilegeLevel.toString());
        } else if (listPrivilegeLevel !== null) {
            const defaultValue = Math.max(1, listPrivilegeLevel - 10);
            setPrivilegeDraft(String(defaultValue));
        } else {
            setPrivilegeDraft("");
        }
    }, [selectedUserData?.privilegeLevel, selectedUserId, listPrivilegeLevel]);

    useEffect(() => {
        setBulkActiveBefore("");
    }, [selectedUserId]);

    const isSelectedUserInList = useMemo(() => {
        return users.some((user) => user.userId === selectedUserId);
    }, [selectedUserId, users]);

    const hasIndefiniteRoles = useMemo(() => {
        return roleRows.some((role) => role.value !== null && role.activeBefore === null);
    }, [roleRows]);

    const maxTimeLimitedActiveBefore = useMemo(() => {
        return roleRows
            .filter((role) => role.value !== null && role.activeBefore !== null)
            .map((role) => role.activeBefore as number)
            .reduce<number | null>((max, date) => (max === null || date > max ? date : max), null);
    }, [roleRows]);

    const hasTimeLimitedRoles = maxTimeLimitedActiveBefore !== null;

    const canDeleteList = useMemo(() => {
        return !!listData && !listData.default && canManage && isCurrentUserOwner(auth.currentAuth, listData.owner);
    }, [auth.currentAuth, canManage, listData]);

    const canEditList = useMemo(() => {
        return !!listData && isCurrentUserOwner(auth.currentAuth, listData.owner);
    }, [auth.currentAuth, listData]);

    // Для «всех пользователей» правила те же, что и для обычного, но управление
    // wildcard-ролями доступно только владельцу, а уровень привилегии не применяется.
    const rolesReadOnly = isEveryone ? !canEditList : readOnlyMode;
    const rolesCanManage = isEveryone ? canEditList : canManage;

    const openUser = useCallback((userId: string) => {
        const normalized = userId.trim();

        if (!normalized) return;

        setSelectedUserId(normalized);
    }, []);

    const refreshCurrentUser = useCallback(async () => {
        if (!selectedUserId) return;

        await Promise.all([reloadUsers(), reloadSelectedUser()]);
    }, [selectedUserId, reloadUsers, reloadSelectedUser]);

    const getRoleRestriction = useCallback(
        (role: RoleRow) => {
            if (!selectedUserId) return t("adminListRestrictionNoUser");
            if (isUserLoading) return t("adminListRestrictionLoading");
            if (rolesReadOnly) return t("adminListRestrictionReadOnly");
            if (strongerSelectedUser) return t("adminListRestrictionStronger");
            if (selectedUserHasZeroPrivilege) return t("adminListRestrictionZeroPrivilege");
            // Управлять можно только ролями, которыми владеет сам админ — как обычный,
            // так и полный (наличие MANAGE не даёт права на «чужие» роли).
            if (!role.owned) return t("adminListRestrictionNotOwned");
            if (
                !rolesCanManage &&
                role.value !== null &&
                role.grantedBy &&
                !isCurrentUserIdentifier(auth.currentAuth, role.grantedBy)
            ) {
                return t("adminListRestrictionLimitedDelete");
            }

            return "";
        },
        [
            auth.currentAuth,
            rolesCanManage,
            isUserLoading,
            rolesReadOnly,
            selectedUserHasZeroPrivilege,
            selectedUserId,
            strongerSelectedUser,
        ]
    );

    const getRoleDeleteRestriction = useCallback(
        (role: RoleRow) => {
            if (role.value === null) return t("adminListRestrictionNoRecord");
            if (!selectedUserId) return t("adminListRestrictionNoUser");
            if (isUserLoading) return t("adminListRestrictionLoading");
            if (rolesReadOnly) return t("adminListRestrictionReadOnly");
            if (strongerSelectedUser) return t("adminListRestrictionStronger");
            if (selectedUserHasZeroPrivilege) return t("adminListRestrictionZeroPrivilege");
            // Удалять можно только роли, которыми владеет сам админ (см. getRoleRestriction).
            if (!role.owned) return t("adminListRestrictionNotOwned");
            if (
                !rolesCanManage &&
                role.grantedBy &&
                !isCurrentUserIdentifier(auth.currentAuth, role.grantedBy)
            ) {
                return t("adminListRestrictionLimitedDeleteOwn");
            }

            return "";
        },
        [
            auth.currentAuth,
            rolesCanManage,
            isUserLoading,
            rolesReadOnly,
            selectedUserHasZeroPrivilege,
            selectedUserId,
            strongerSelectedUser,
        ]
    );

    const bulkDateEditableCount = roleRows.reduce((count, role) => {
        const draft = getRoleDraft(role);

        if (getRoleRestriction(role) || draft.value === null) {
            return count;
        }

        return count + 1;
    }, 0);

    const applyBulkActiveBefore = (value: string = bulkActiveBefore) => {
        if (bulkDateEditableCount === 0) return;

        setRoleDrafts((currentDrafts) => {
            const nextDrafts = { ...currentDrafts };
            let hasChanges = false;

            roleRows.forEach((role) => {
                if (getRoleRestriction(role)) return;

                const draft = getRoleDraft(role, currentDrafts);

                if (draft.value === null || draft.activeBefore === value) {
                    return;
                }

                nextDrafts[role.name] = {
                    ...draft,
                    activeBefore: value,
                };
                hasChanges = true;
            });

            return hasChanges ? nextDrafts : currentDrafts;
        });
    };

    const pendingChanges = roleRows.reduce<PendingChange[]>((acc, role) => {
        const draft = roleDrafts[role.name];

        if (!draft) return acc;

        const draftActiveBefore =
            draft.value === null ? null : fromDateTimeLocalInputValue(draft.activeBefore);
        const roleActiveBefore =
            role.value === null
                ? null
                : fromDateTimeLocalInputValue(toDateTimeLocalInputValue(role.activeBefore));
        const previousValue = role.value ?? null;

        if (draft.value !== previousValue || draftActiveBefore !== roleActiveBefore) {
            acc.push({
                activeBefore: draftActiveBefore,
                name: role.name,
                previousValue,
                value: draft.value,
            });
        }

        return acc;
    }, []);

    const myGrantedRoles = useMemo(() => {
        return roleRows.filter(
            (role) =>
                role.value !== null &&
                role.grantedBy !== null &&
                isCurrentUserIdentifier(auth.currentAuth, role.grantedBy) &&
                !getRoleDeleteRestriction(role)
        );
    }, [roleRows, auth.currentAuth, getRoleDeleteRestriction]);

    const handleMarkMyRolesForDeletion = useCallback(() => {
        setRoleDrafts((currentDrafts) => {
            const next = { ...currentDrafts };
            myGrantedRoles.forEach((role) => {
                next[role.name] = { activeBefore: "", value: null };
            });
            return next;
        });
    }, [myGrantedRoles]);

    const applyChanges = async () => {
        if (!selectedUserId || pendingChanges.length === 0) return;
        if (!isEveryone && selectedUserHasZeroPrivilege) return;

        setApplyingChanges(true);

        try {
            const payload = pendingChanges.map((change) => ({
                activeBefore: change.activeBefore,
                name: change.name,
                value: change.value,
            }));

            if (isEveryone) {
                await adminListApi.patchAdminListEveryoneRoles(listId, payload);
            } else {
                await adminListApi.patchAdminListUserRoles(listId, selectedUserId, payload);
            }

            toast({
                title: t("adminListToastSaved", { count: String(pendingChanges.length) }),
                type: "success",
            });

            await refreshCurrentUser();
        } catch (error) {
            toast({
                title: t("adminListToastSaveFailed"),
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setApplyingChanges(false);
        }
    };

    const saveListChanges = async (patch: AdminListPatchInWeb) => {
        if (!listData?.id) return;

        if (patch.comment === undefined && patch.valueChangeType === undefined) {
            setEditingList(false);
            return;
        }

        setSavingList(true);

        try {
            await adminListApi.patchAdminList(listData.id, patch);

            toast({
                title: t("adminListToastListUpdated"),
                type: "success",
            });

            setEditingList(false);
            await reloadList();
        } catch (error) {
            toast({
                title: t("adminListToastListUpdateFailed"),
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setSavingList(false);
        }
    };

    const deleteUserFromList = async () => {
        if (!listData?.id || !selectedUserId) return;
        if (!(await confirm(t("adminListConfirmDeleteUser", { id: String(listData.id), userId: selectedUserId })))) return;

        setDeletingUser(true);

        try {
            await adminListApi.deleteAdminListUser(listData.id, selectedUserId);

            toast({
                title: t("adminListToastUserDeleted", { userId: selectedUserId }),
                type: "success",
            });

            setSelectedUserId("");
            await reloadUsers();
        } catch (error) {
            toast({
                title: t("adminListToastUserDeleteFailed"),
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setDeletingUser(false);
        }
    };

    const deleteEveryoneRoles = async () => {
        if (!listData?.id) return;
        if (!(await confirm(t("adminListEveryoneConfirmDelete", { id: String(listData.id) })))) return;

        setDeletingUser(true);

        try {
            await adminListApi.deleteAdminListEveryone(listData.id);

            toast({
                title: t("adminListToastEveryoneDeleted"),
                type: "success",
            });

            await reloadEveryone();
        } catch (error) {
            toast({
                title: t("adminListToastEveryoneDeleteFailed"),
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setDeletingUser(false);
        }
    };

    const deleteList = async () => {
        if (!listData?.id) return;
        if (!(await confirm(t("adminListConfirmDelete", { id: String(listData.id) })))) return;

        setDeletingList(true);

        try {
            await adminListApi.deleteAdminList(listData.id);

            toast({
                title: t("adminListToastListDeleted", { id: String(listData.id) }),
                type: "success",
            });

            navigate("/admin-list");
        } catch (error) {
            toast({
                title: t("adminListToastListDeleteFailed", { id: String(listData.id) }),
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setDeletingList(false);
        }
    };

    const normalizedPrivilegeDraft = privilegeDraft.trim();
    const parsedPrivilegeDraft = normalizedPrivilegeDraft ? Number(normalizedPrivilegeDraft) : null;
    const privilegeHasError =
        normalizedPrivilegeDraft.length > 0 &&
        (!Number.isInteger(parsedPrivilegeDraft) || Number(parsedPrivilegeDraft) < 1);
    const privilegeTooHighError =
        parsedPrivilegeDraft !== null &&
        listPrivilegeLevel !== null &&
        parsedPrivilegeDraft >= listPrivilegeLevel;
    const privilegeChanged = (selectedUserData?.privilegeLevel ?? null) !== parsedPrivilegeDraft;
    const privilegeRestriction = !selectedUserId
        ? t("adminListRestrictionNoUser")
        : isUserLoading
          ? t("adminListRestrictionLoading")
          : readOnlyMode
            ? t("adminListRestrictionPrivilegeReadOnly")
            : strongerSelectedUser
              ? t("adminListRestrictionPrivilegeStronger")
              : "";

    const savePrivilege = async () => {
        if (!selectedUserId || parsedPrivilegeDraft === null || privilegeRestriction || privilegeHasError || privilegeTooHighError) return;

        setSavingPrivilege(true);

        try {
            await adminListApi.patchAdminListUserPrivilegeLevel(listId, selectedUserId, parsedPrivilegeDraft);

            toast({
                title: t("adminListToastPrivilegeUpdated"),
                type: "success",
            });

            await refreshCurrentUser();
        } catch (error) {
            toast({
                title: t("adminListToastPrivilegeUpdateFailed"),
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setSavingPrivilege(false);
        }
    };

    // ---- Применение шаблона выдачи ролей ----
    // Полное развёртывание (PUT) доступно только полному управляющему, владеющему всеми
    // ролями шаблона; иначе — раскладка ролей в черновики (как ручное прокликивание).
    const computeCanDeployTemplate = (template: AdminListTemplateOutWeb): boolean => {
        // deploy (PUT) заменяет запись целиком, включая привилегию из шаблона — поэтому сила 0
        // у нового пользователя НЕ блокирует: шаблон сам задаст ненулевую силу.
        if (!canManage || isEveryone || strongerSelectedUser) {
            return false;
        }

        return (template.roles || []).every((role) => hasOwnedListRole(listData?.roles, role.name));
    };

    const deployTemplate = async (template: AdminListTemplateOutWeb) => {
        if (!selectedUserId || isEveryone) return;

        const roles = (template.roles || []).map((role) => ({
            name: role.name,
            // значение шаблона (true — грант, false — снятие) применяется как есть
            value: role.value,
            activeBefore: null as number | null,
        }));

        if (roles.length === 0) return;

        const privilege =
            template.privilegeLevel ??
            selectedUserPrivilegeLevel ??
            Math.max(1, (listPrivilegeLevel ?? 1) - 10);

        if (
            !Number.isInteger(privilege) ||
            privilege < 1 ||
            (listPrivilegeLevel !== null && privilege >= listPrivilegeLevel)
        ) {
            toast({
                title: t("adminListTemplateDeployPrivilegeError", {
                    level: listPrivilegeLevel !== null ? String(listPrivilegeLevel) : "?",
                }),
                type: "error",
                time: 10000,
            });
            return;
        }

        if (
            !(await confirm(
                t("adminListTemplateDeployConfirm", {
                    count: String(roles.length),
                    level: String(privilege),
                }),
                // деструктивно (замена записи целиком) → красная кнопка «Заменить»
                { confirmButton: t("adminListTemplatesApplyDeploy"), negative: true }
            ))
        ) {
            return;
        }

        setApplyingTemplate(true);

        try {
            const payload: AdminListRolePutInWeb = { roles, privilegeLevel: privilege };

            await adminListApi.replaceAdminListUser(listId, selectedUserId, payload);

            toast({ title: t("adminListTemplateDeployedToast"), type: "success" });

            await refreshCurrentUser();
        } catch (error) {
            toast({
                title: t("adminListTemplateDeployFailedToast"),
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setApplyingTemplate(false);
        }
    };

    const stageTemplate = async (template: AdminListTemplateOutWeb) => {
        const allRoles = template.roles || [];
        const applicable = allRoles.filter((role) => {
            const row = roleByName.get(role.name);
            return !!row && presentRoleNames.has(role.name) && !getRoleRestriction(row);
        });
        const skipped = allRoles.length - applicable.length;

        if (
            !(await confirm(
                t("adminListTemplateStageConfirm", { count: String(applicable.length) }),
                // недеструктивно (раскладка в черновики) → обычная кнопка «Применить»
                { confirmButton: t("adminListTemplatesApplyStage"), negative: false }
            ))
        ) {
            return;
        }

        setRoleDrafts((currentDrafts) => {
            let nextDrafts = currentDrafts;

            applicable.forEach((role) => {
                nextDrafts = cascadeHierarchyDrafts(
                    nextDrafts,
                    role.name,
                    // значение шаблона (true — грант, false — снятие) раскладывается как есть
                    { value: role.value, activeBefore: "" },
                    presentRoleNames
                );
            });

            return nextDrafts;
        });

        // привилегию только префиллим (стейджинг) — сохранение штатной кнопкой
        if (template.privilegeLevel != null && !privilegeRestriction) {
            setPrivilegeDraft(String(template.privilegeLevel));
        }

        if (applicable.length === 0) {
            toast({ title: t("adminListTemplateStagedNone"), type: "warning" });
            return;
        }

        toast({
            title: t("adminListTemplateStagedToast", { count: String(applicable.length) }),
            description:
                skipped > 0
                    ? t("adminListTemplateStagedSkipped", { count: String(skipped) })
                    : undefined,
            type: "success",
        });
    };

    // Раскладка ролей шаблона в редактор («Применить») — путь вставки: как ручное
    // прокликивание. Осмысленна только при установленной (ненулевой) силе пользователя —
    // иначе правки ролей всё равно заблокированы; поэтому кнопка появляется лишь тогда.
    const computeCanStageTemplate = (template: AdminListTemplateOutWeb): boolean => {
        if (!canInsert || isEveryone || strongerSelectedUser) return false;
        if ((template.roles?.length ?? 0) === 0) return false;
        return selectedUserPrivilegeLevel !== null && selectedUserPrivilegeLevel > 0;
    };

    // Значения контрола применения шаблона вынесены из JSX: вложенные тернарники и
    // инлайн-стрелки в разметке сбивают control-flow-анализ react-hooks/rules-of-hooks.
    const showTemplateApply = !isEveryone && !rolesReadOnly && adminListTemplates.length > 0;
    // причина, по которой шаблон нельзя ни заменить, ни применить (показывается, когда
    // недоступны обе кнопки)
    const templateApplyDisabledReason = (
        template: AdminListTemplateOutWeb
    ): string | undefined => {
        if (strongerSelectedUser) return t("adminListBlockedStrongerUser");
        if ((template.roles?.length ?? 0) === 0) return t("adminListTemplatesApplyEmpty");
        // «Заменить» сам задаёт привилегию; «Применить» требует ненулевой силы
        if (selectedUserHasZeroPrivilege) return t("adminListTemplateApplyRaisePrivilege");
        return undefined;
    };

    if (!Number.isFinite(listId)) {
        return (
            <div className="admin-list-details">
                <Container>
                    <MetaRobots noIndex />
                    <Message error>
                        <Message.Header>{t("adminListErrorInvalidId")}</Message.Header>
                        <p>{t("adminListErrorInvalidIdDesc")}</p>
                    </Message>
                </Container>
            </div>
        );
    }

    if (isListLoading && !listData && !listErrorMessage) {
        return (
            <div className="admin-list-details">
                <Container>
                    <MetaRobots noIndex />
                    <Breadcrumbs items={listBreadcrumbItems} />
                    <Segment className="empty">
                        <Loader active inline="centered" />
                    </Segment>
                </Container>
            </div>
        );
    }

    if (listErrorMessage && !listData) {
        return (
            <div className="admin-list-details">
                <Container>
                    <MetaRobots noIndex />
                    <Breadcrumbs items={listBreadcrumbItems} />
                    <Message error>
                        <Message.Header>{t("adminListErrorLoadFailed")}</Message.Header>
                        <p>{listErrorMessage}</p>
                    </Message>
                </Container>
            </div>
        );
    }

    const refreshAll = () => {
        void reloadList();
        void reloadUsers();
        if (selectedUserId) {
            void reloadSelectedUser();
        }
    };

    const toolbar = (
        <>
            <Button basic onClick={refreshAll} type="button">
                {t("adminListButtonRefresh")}
            </Button>
            {canInsert && (
                <Button as={Link} basic to={`/admin-list/${listId}/templates`}>
                    {t("adminListTemplatesLink")}
                </Button>
            )}
            {canEditList && (
                <Button
                    basic
                    disabled={isEditingList || isSavingList}
                    onClick={() => setEditingList(true)}
                    type="button"
                >
                    {t("edit")}
                </Button>
            )}
            <Button
                color="red"
                disabled={!canDeleteList}
                loading={isDeletingList}
                onClick={() => {
                    void deleteList();
                }}
                type="button"
            >
                {t("adminListButtonDeleteList")}
            </Button>
        </>
    );

    return (
        <div className="admin-list-details">
            <Container className="extra">
                <MetaRobots noIndex />

                <Breadcrumbs items={listBreadcrumbItems} />

                {listData && (
                    <AdminListCard
                        list={isEditingList ? { ...listData, comment: listData.comment } : listData}
                        listId={listId}
                        toolbar={toolbar}
                    />
                )}

                {isEditingList && listData && (
                    <AdminListEditForm
                        list={listData}
                        isSaving={isSavingList}
                        onCancel={() => setEditingList(false)}
                        onSave={(patch) => {
                            void saveListChanges(patch);
                        }}
                    />
                )}

                {listErrorMessage && (
                    <Message error>
                        <Message.Header>{t("adminListErrorLoadFailed")}</Message.Header>
                        <p>{listErrorMessage}</p>
                    </Message>
                )}

                {!canDeleteList && listData?.default && (
                    <Message info>{t("adminListInfoDefault")}</Message>
                )}

                {readOnlyMode && !isEveryone && (
                    <Message warning>
                        <Message.Header>{t("adminListReadOnlyHeader")}</Message.Header>
                        <p>{t("adminListReadOnlyDesc")}</p>
                        <List bulleted>
                            {readOnlyReasons.map((reason) => {
                                return <List.Item key={reason}>{reason}</List.Item>;
                            })}
                        </List>
                        <p>
                            {t("adminListDetailsDiagnostics")} canInsert = <b>{canInsert ? "true" : "false"}</b>, canManage ={" "}
                            <b>{canManage ? "true" : "false"}</b>, listPrivilegeLevel ={" "}
                            <b>{listPrivilegeLevel !== null ? listPrivilegeLevel : "null"}</b>, currentUser ={" "}
                            <b>{auth.currentAuth?.connectorId ?? "null"}</b>, listOwner ={" "}
                            <b>{listData?.owner || "null"}</b>, ownedRoles ={" "}
                            <b>
                                {ownedAdminListRoles.length > 0 ? ownedAdminListRoles.join(", ") : "none"}
                            </b>
                            .
                        </p>
                    </Message>
                )}

                <Grid stackable>
                    <Grid.Column computer={4} mobile={16} tablet={5}>
                        <AdminListUserSidebar
                            users={users}
                            selectedUserId={selectedUserId}
                            isLoading={isUsersLoading}
                            errorMessage={usersErrorMessage}
                            everyoneAvailable={canEditList}
                            onOpenUser={openUser}
                        />
                    </Grid.Column>

                    <Grid.Column computer={12} mobile={16} tablet={11}>
                        <Segment className="content">
                            {!selectedUserId ? (
                                <div className="empty">
                                    <Message info>
                                        {t("adminListSelectUserHint")}
                                    </Message>
                                </div>
                            ) : (
                                <>
                                    <div className="user-header">
                                        <div>
                                            <Header as="h2">
                                                {isEveryone ? (
                                                    <>
                                                        <Icon name="users" />
                                                        {t("adminListEveryoneTitle")}
                                                    </>
                                                ) : (
                                                    <UserIdLabel userId={selectedUserId} />
                                                )}
                                            </Header>
                                            <div className="user-header-labels">
                                                {isEveryone ? (
                                                    <Label basic color="blue">
                                                        {t("adminListEveryoneLabel")}
                                                    </Label>
                                                ) : (
                                                    <>
                                                        <Label basic color={isSelectedUserInList ? "green" : undefined}>
                                                            {isSelectedUserInList ? t("adminListLabelInList") : t("adminListLabelNewUser")}
                                                        </Label>
                                                        {selectedUserPrivilegeLevel !== null && (
                                                            <Label basic color="teal">
                                                                {t("adminListLabelUserStrength", { level: String(selectedUserPrivilegeLevel) })}
                                                            </Label>
                                                        )}
                                                        {strongerSelectedUser && (
                                                            <Label color="yellow">{t("adminListLabelStrongerUser")}</Label>
                                                        )}
                                                    </>
                                                )}
                                                {hasIndefiniteRoles && (
                                                    <Label basic color="blue">
                                                        {t("adminListLabelHasIndefiniteRoles")}
                                                    </Label>
                                                )}
                                                {hasTimeLimitedRoles && (
                                                    <Label basic color="orange">
                                                        {t("adminListLabelTimeLimitedRoles", { date: formatAdminListDateValue(maxTimeLimitedActiveBefore) })}
                                                    </Label>
                                                )}
                                            </div>
                                        </div>

                                        {isUserLoading && <Loader active inline size="small" />}

                                        {isEveryone
                                            ? canEditList && (
                                                  <Button
                                                      color="red"
                                                      disabled={isDeletingUser}
                                                      loading={isDeletingUser}
                                                      onClick={() => {
                                                          void deleteEveryoneRoles();
                                                      }}
                                                      type="button"
                                                  >
                                                      {t("adminListEveryoneDelete")}
                                                  </Button>
                                              )
                                            : canManage && isSelectedUserInList && (
                                                  <Button
                                                      color="red"
                                                      disabled={isDeletingUser}
                                                      loading={isDeletingUser}
                                                      onClick={() => {
                                                          void deleteUserFromList();
                                                      }}
                                                      type="button"
                                                  >
                                                      {t("adminListButtonDeleteUser")}
                                                  </Button>
                                              )}
                                    </div>

                                    {userErrorMessage && (
                                        <Message warning>
                                            <Message.Header>
                                                {t("adminListErrorUserLoadFailed")}
                                            </Message.Header>
                                            <p>{userErrorMessage}</p>
                                        </Message>
                                    )}

                                    {strongerSelectedUser && (
                                        <Message warning>
                                            {t("adminListBlockedStrongerUser")}
                                        </Message>
                                    )}

                                    {selectedUserHasZeroPrivilege && (
                                        <Message warning>
                                            {t("adminListBlockedZeroPrivilege")}
                                        </Message>
                                    )}

                                    {showTemplateApply && (
                                        <ApplyTemplateControl
                                            templates={adminListTemplates}
                                            getCanDeploy={computeCanDeployTemplate}
                                            getCanStage={computeCanStageTemplate}
                                            getDisabledReason={templateApplyDisabledReason}
                                            isBusy={isApplyingTemplate}
                                            onDeploy={deployTemplate}
                                            onStage={stageTemplate}
                                        />
                                    )}

                                    {!isEveryone && (
                                    <Segment>
                                        <Header as="h3">{t("adminListPrivilegeHeader")}</Header>
                                        <div className="privilege-row">
                                            <Form.Input
                                                error={privilegeHasError}
                                                min={1}
                                                onChange={(_, data) => {
                                                    setPrivilegeDraft((data.value as string) || "");
                                                }}
                                                step={1}
                                                type="number"
                                                value={privilegeDraft}
                                            />
                                            <Button
                                                disabled={
                                                    !!privilegeRestriction ||
                                                    privilegeHasError ||
                                                    privilegeTooHighError ||
                                                    parsedPrivilegeDraft === null ||
                                                    !privilegeChanged
                                                }
                                                loading={isSavingPrivilege}
                                                onClick={() => {
                                                    void savePrivilege();
                                                }}
                                                primary
                                                type="button"
                                            >
                                                {t("adminListPrivilegeSave")}
                                            </Button>
                                        </div>
                                        {privilegeHasError && (
                                            <Message error>
                                                {t("adminListPrivilegeError")}
                                            </Message>
                                        )}
                                        {privilegeTooHighError && (
                                            <Message error>
                                                {t("adminListPrivilegeTooHighError", { level: String(listPrivilegeLevel) })}
                                            </Message>
                                        )}
                                        {privilegeRestriction && <Message info>{privilegeRestriction}</Message>}
                                    </Segment>
                                    )}

                                    {roleRows.length === 0 ? (
                                        <Message info>
                                            {t("adminListRolesEmpty")}
                                        </Message>
                                    ) : (
                                        <>
                                            <Form
                                                className="bulk-date"
                                                onSubmit={(event) => {
                                                    event.preventDefault();
                                                    if (!bulkActiveBefore) return;
                                                    applyBulkActiveBefore();
                                                }}
                                            >
                                                <div className="bulk-date-row">
                                                    <Form.Input
                                                        className="bulk-date-input"
                                                        label={t("adminListBulkDateLabel")}
                                                        onChange={(_, data) => {
                                                            setBulkActiveBefore((data.value as string) || "");
                                                        }}
                                                        type="datetime-local"
                                                        value={bulkActiveBefore}
                                                    />
                                                    <Button
                                                        disabled={
                                                            !bulkActiveBefore ||
                                                            bulkDateEditableCount === 0 ||
                                                            isApplyingChanges
                                                        }
                                                        primary
                                                        type="submit"
                                                    >
                                                        {t("adminListBulkDateApply", { count: String(bulkDateEditableCount) })}
                                                    </Button>
                                                    <Button
                                                        basic
                                                        disabled={
                                                            bulkDateEditableCount === 0 || isApplyingChanges
                                                        }
                                                        onClick={() => applyBulkActiveBefore("")}
                                                        type="button"
                                                    >
                                                        {t("adminListBulkDateIndefinite", { count: String(bulkDateEditableCount) })}
                                                    </Button>
                                                    <Button
                                                        basic
                                                        color="red"
                                                        disabled={myGrantedRoles.length === 0 || isApplyingChanges}
                                                        onClick={handleMarkMyRolesForDeletion}
                                                        type="button"
                                                    >
                                                        {t("adminListBulkDeleteMine", { count: String(myGrantedRoles.length) })}
                                                    </Button>
                                                </div>
                                            </Form>
                                            <Segment className="pending">
                                                <div className="pending-header">
                                                    <Header
                                                        as="h3"
                                                        onClick={() => setPendingExpanded((value) => !value)}
                                                        style={{ cursor: "pointer", margin: 0 }}
                                                    >
                                                        <Icon
                                                            name={isPendingExpanded ? "caret down" : "caret right"}
                                                        />
                                                        {t("adminListPendingHeader")}
                                                        {pendingChanges.length > 0 && (
                                                            <Label circular color="blue" size="small">
                                                                {pendingChanges.length}
                                                            </Label>
                                                        )}
                                                    </Header>
                                                    <div className="pending-actions">
                                                        <Button
                                                            basic
                                                            disabled={
                                                                pendingChanges.length === 0 || isApplyingChanges
                                                            }
                                                            onClick={resetDrafts}
                                                            type="button"
                                                        >
                                                            {t("adminListPendingReset")}
                                                        </Button>
                                                        <Button
                                                            disabled={
                                                                pendingChanges.length === 0 ||
                                                                rolesReadOnly ||
                                                                selectedUserHasZeroPrivilege ||
                                                                strongerSelectedUser
                                                            }
                                                            loading={isApplyingChanges}
                                                            onClick={() => {
                                                                void applyChanges();
                                                            }}
                                                            primary
                                                            type="button"
                                                        >
                                                            {t("adminListPendingApply", { count: String(pendingChanges.length) })}
                                                        </Button>
                                                    </div>
                                                </div>
                                                {isPendingExpanded &&
                                                    (pendingChanges.length === 0 ? (
                                                        <Message info size="small">
                                                            {t("adminListPendingEmpty")}
                                                        </Message>
                                                    ) : (
                                                        <List
                                                            bulleted
                                                            className="pending-list"
                                                        >
                                                            {pendingChanges.map((change) => {
                                                                const describe = (
                                                                    value: boolean | number | null
                                                                ) => {
                                                                    if (value === null) return t("adminListPendingValueNone");
                                                                    if (value === true) return t("adminListPendingValueAllowed");
                                                                    if (value === false) return t("adminListPendingValueDenied");
                                                                    if (value === 0) return t("adminListPendingValueNoChange");
                                                                    return String(value);
                                                                };

                                                                return (
                                                                    <List.Item key={change.name}>
                                                                        <strong>{resolveAdminListRoleTitle(change.name, t)}</strong>:{" "}
                                                                        {describe(change.previousValue)}
                                                                        {" → "}
                                                                        <strong>{describe(change.value)}</strong>
                                                                        {change.value !== null &&
                                                                            change.activeBefore && (
                                                                                <>
                                                                                    {" "}
                                                                                    ({t("adminListPendingDateSuffix", { date: formatAdminListDateValue(change.activeBefore) })})
                                                                                </>
                                                                            )}
                                                                    </List.Item>
                                                                );
                                                            })}
                                                        </List>
                                                    ))}
                                            </Segment>

                                            <AdminListRolesTable
                                                roleRows={roleRows}
                                                roleDrafts={roleDrafts}
                                                listMode={listMode}
                                                isApplyingChanges={isApplyingChanges}
                                                getRoleRestriction={getRoleRestriction}
                                                getRoleDeleteRestriction={getRoleDeleteRestriction}
                                                onDraftChange={handleDraftChange}
                                                onResetRow={handleResetRow}
                                                onMarkForDeletion={handleMarkForDeletion}
                                            />
                                        </>
                                    )}
                                </>
                            )}
                        </Segment>
                    </Grid.Column>
                </Grid>
            </Container>

            {confirmModal}
        </div>
    );
}

export default AdminListDetailsPage;
