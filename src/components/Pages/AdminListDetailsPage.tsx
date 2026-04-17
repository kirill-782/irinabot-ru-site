import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { PendingChange, RoleDraft, RoleRow } from "../AdminList/interfaces";
import MetaRobots from "../Meta/MetaRobots";
import { AppRuntimeSettingsContext, AuthContext, RestContext } from "../../context";
import { useTitle } from "../../hooks/useTitle";
import { useAdminList } from "../../hooks/useAdminList";
import { useAdminListUsers } from "../../hooks/useAdminListUsers";
import { useAdminListUser } from "../../hooks/useAdminListUser";
import { useResolveConnectorIds } from "../../hooks/useResolveConnectorIds";
import {
    AdminListOutWebRole,
    AdminListPatchInWeb,
    AdminListUserOutWebRole,
} from "../../models/rest/AdminList";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import {
    formatAdminListDateValue,
    fromDateTimeLocalInputValue,
    isCurrentUserIdentifier,
    isCurrentUserOwner,
    normalizeAdminListValueChangeType,
    toDateTimeLocalInputValue,
} from "../../utils/AdminListUtils";

import "../AdminList/AdminListDetails.scss";

const ADMIN_LIST_INSERT_ROLE = "PERMISSION_ADMIN_LIST_INSERT";
const ADMIN_LIST_MANAGE_ROLE = "PERMISSION_ADMIN_LIST_MANAGE";

const hasOwnedListRole = (roles: AdminListOutWebRole[] | null | undefined, roleName: string) => {
    return (roles || []).some((role) => {
        return !!role.owned && (role.name || "").toLocaleUpperCase() === roleName.toLocaleUpperCase();
    });
};

function AdminListDetailsPage() {
    const navigate = useNavigate();
    const params = useParams();
    const listId = Number(params.id);
    const { adminListApi } = useContext(RestContext);
    const auth = useContext(AuthContext).auth;
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

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

    const [selectedUserId, setSelectedUserId] = useState("");

    const {
        data: selectedUserData,
        isLoading: isUserLoading,
        errorMessage: userErrorMessage,
        reload: reloadSelectedUser,
    } = useAdminListUser(listId, selectedUserId);

    const [roleDrafts, setRoleDrafts] = useState<Record<string, RoleDraft>>({});
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

    useEffect(() => {
        const nextDrafts = roleRows.reduce<Record<string, RoleDraft>>((acc, role) => {
            acc[role.name] = {
                activeBefore: toDateTimeLocalInputValue(role.activeBefore),
                value: role.value ?? null,
            };

            return acc;
        }, {});

        setRoleDrafts(nextDrafts);
    }, [roleRows]);

    useEffect(() => {
        console.debug("[privilegeDraft] effect fired", {
            selectedUserId,
            privilegeLevel: selectedUserData?.privilegeLevel,
            privilegeLevelType: typeof selectedUserData?.privilegeLevel,
            listPrivilegeLevel,
        });
        if (selectedUserData?.privilegeLevel != null && selectedUserData.privilegeLevel !== 0) {
            console.debug("[privilegeDraft] branch: existing user →", selectedUserData.privilegeLevel);
            setPrivilegeDraft(selectedUserData.privilegeLevel.toString());
        } else if (listPrivilegeLevel !== null) {
            const defaultValue = Math.max(1, listPrivilegeLevel - 10);
            console.debug("[privilegeDraft] branch: new user → listPrivilegeLevel =", listPrivilegeLevel, "→ defaultValue =", defaultValue);
            setPrivilegeDraft(String(defaultValue));
        } else {
            console.debug("[privilegeDraft] branch: empty (listPrivilegeLevel is null)");
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
            .map((role) => role.activeBefore as string)
            .reduce<string | null>((max, date) => (max === null || date > max ? date : max), null);
    }, [roleRows]);

    const hasTimeLimitedRoles = maxTimeLimitedActiveBefore !== null;

    const canDeleteList = useMemo(() => {
        return !!listData && !listData.default && canManage && isCurrentUserOwner(auth.currentAuth, listData.owner);
    }, [auth.currentAuth, canManage, listData]);

    const canEditList = useMemo(() => {
        return !!listData && isCurrentUserOwner(auth.currentAuth, listData.owner);
    }, [auth.currentAuth, listData]);

    const openUser = useCallback((userId: string) => {
        const normalized = userId.trim();

        if (!normalized) return;

        setSelectedUserId(normalized);
    }, []);

    const refreshCurrentUser = useCallback(async () => {
        if (!selectedUserId) return;

        await Promise.all([reloadUsers(), reloadSelectedUser()]);
    }, [selectedUserId, reloadUsers, reloadSelectedUser]);

    const getRoleDraft = useCallback(
        (role: RoleRow, drafts: Record<string, RoleDraft> = roleDrafts) => {
            return (
                drafts[role.name] || {
                    activeBefore: toDateTimeLocalInputValue(role.activeBefore),
                    value: role.value ?? null,
                }
            );
        },
        [roleDrafts]
    );

    const getRoleRestriction = useCallback(
        (role: RoleRow) => {
            if (!selectedUserId) return t("adminListRestrictionNoUser");
            if (isUserLoading) return t("adminListRestrictionLoading");
            if (readOnlyMode) return t("adminListRestrictionReadOnly");
            if (strongerSelectedUser) return t("adminListRestrictionStronger");
            if (selectedUserHasZeroPrivilege) return t("adminListRestrictionZeroPrivilege");
            if (
                !canManage &&
                role.value !== null &&
                role.grantedBy &&
                !isCurrentUserIdentifier(auth.currentAuth, role.grantedBy)
            ) {
                return t("adminListRestrictionLimitedDelete");
            }
            if (!canManage && role.value === null && !role.owned && !role.declared) {
                return t("adminListRestrictionLimitedGrant");
            }

            return "";
        },
        [
            auth.currentAuth,
            canManage,
            isUserLoading,
            readOnlyMode,
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
            if (readOnlyMode) return t("adminListRestrictionReadOnly");
            if (strongerSelectedUser) return t("adminListRestrictionStronger");
            if (selectedUserHasZeroPrivilege) return t("adminListRestrictionZeroPrivilege");
            if (
                !canManage &&
                role.grantedBy &&
                !isCurrentUserIdentifier(auth.currentAuth, role.grantedBy)
            ) {
                return t("adminListRestrictionLimitedDeleteOwn");
            }

            return "";
        },
        [
            auth.currentAuth,
            canManage,
            isUserLoading,
            readOnlyMode,
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

    const handleDraftChange = useCallback((roleName: string, next: RoleDraft) => {
        setRoleDrafts((currentDrafts) => ({
            ...currentDrafts,
            [roleName]: next,
        }));
    }, []);

    const handleResetRow = useCallback((roleName: string) => {
        setRoleDrafts((currentDrafts) => {
            const { [roleName]: _omit, ...rest } = currentDrafts;

            return rest;
        });
    }, []);

    const handleMarkForDeletion = useCallback((role: RoleRow) => {
        setRoleDrafts((currentDrafts) => ({
            ...currentDrafts,
            [role.name]: {
                activeBefore: "",
                value: null,
            },
        }));
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

    const resetChanges = () => {
        const nextDrafts = roleRows.reduce<Record<string, RoleDraft>>((acc, role) => {
            acc[role.name] = {
                activeBefore: toDateTimeLocalInputValue(role.activeBefore),
                value: role.value ?? null,
            };

            return acc;
        }, {});

        setRoleDrafts(nextDrafts);
    };

    const applyChanges = async () => {
        if (!selectedUserId || selectedUserHasZeroPrivilege || pendingChanges.length === 0) return;

        setApplyingChanges(true);

        try {
            await adminListApi.patchAdminListUserRoles(
                listId,
                selectedUserId,
                pendingChanges.map((change) => ({
                    activeBefore: change.activeBefore,
                    name: change.name,
                    value: change.value,
                }))
            );

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
        if (!window.confirm(t("adminListConfirmDeleteUser", { id: String(listData.id), userId: selectedUserId }))) return;

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

    const deleteList = async () => {
        if (!listData?.id) return;
        if (!window.confirm(t("adminListConfirmDelete", { id: String(listData.id) }))) return;

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
                    <Button as={Link} basic size="small" to="/admin-list">
                        {t("adminListBackToLists")}
                    </Button>
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

                {listData && (
                    <AdminListCard
                        list={isEditingList ? { ...listData, comment: listData.comment } : listData}
                        listId={listId}
                        showBackLink
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

                {readOnlyMode && (
                    <Message warning>
                        <Message.Header>{t("adminListReadOnlyHeader")}</Message.Header>
                        <p>{t("adminListReadOnlyDesc")}</p>
                        <List bulleted>
                            {readOnlyReasons.map((reason) => {
                                return <List.Item key={reason}>{reason}</List.Item>;
                            })}
                        </List>
                        <p>
                            Диагностика: canInsert = <b>{canInsert ? "true" : "false"}</b>, canManage ={" "}
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
                                                <UserIdLabel userId={selectedUserId} />
                                            </Header>
                                            <div className="user-header-labels">
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

                                        {canManage && isSelectedUserInList && (
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
                                                            onClick={resetChanges}
                                                            type="button"
                                                        >
                                                            {t("adminListPendingReset")}
                                                        </Button>
                                                        <Button
                                                            disabled={
                                                                pendingChanges.length === 0 ||
                                                                readOnlyMode ||
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
                                                                        <strong>{change.name}</strong>:{" "}
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
        </div>
    );
}

export default AdminListDetailsPage;
