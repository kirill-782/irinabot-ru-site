import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import {
    Button,
    Checkbox,
    Divider,
    Dropdown,
    DropdownItemProps,
    Form,
    Header,
    Input,
    Label,
    List,
    Loader,
    Message,
    Segment,
} from "semantic-ui-react";
import { RestContext } from "../../context";
import { useTitle } from "../../hooks/useTitle";
import {
    AdminListGlobalOutWeb,
    AdminListRawChangeItem,
    AdminListRawChangesInWeb,
    AdminListRawRoleItem,
    AdminListRoleUsersOutWeb,
} from "../../models/rest/AdminList";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import AdminListRolesTable from "../AdminList/AdminListRolesTable";
import { RoleDraft, RoleRow } from "../AdminList/interfaces";

import "../AdminList/AdminListDetails.scss";

interface DraftRole {
    name: string;
    owner: string | null;
    value: number;
}

interface DraftChange {
    targetUserIdNull: boolean;
    targetUserId: string;
    purge: boolean;
    roles: DraftRole[];
}

const emptyDraft = (): DraftChange => ({
    targetUserIdNull: false,
    targetUserId: "",
    purge: false,
    roles: [],
});

function rolesForUser(
    listRoles: AdminListRoleUsersOutWeb[],
    targetUserId: string | null
): DraftRole[] {
    const result: DraftRole[] = [];

    for (const roleEntry of listRoles) {
        const name = roleEntry.name;

        if (!name) continue;

        const userEntry = (roleEntry.users ?? []).find((u) => u.userId === targetUserId);

        if (userEntry) {
            result.push({
                name,
                owner: userEntry.grantedBy ?? null,
                value: userEntry.value ?? 0,
            });
        }
    }

    return result;
}

function AdminListAppAdminPage() {
    const { adminListAppAdminApi } = useContext(RestContext);

    useTitle("Admin list — администратор");

    // --- кеш ---
    const [invalidatingAll, setInvalidatingAll] = useState(false);
    const [cacheUserId, setCacheUserId] = useState("");
    const [invalidatingUser, setInvalidatingUser] = useState(false);

    const [initUserId, setInitUserId] = useState("");
    const [initializingUser, setInitializingUser] = useState(false);

    // --- глобальные списки ---
    const [globalLists, setGlobalLists] = useState<AdminListGlobalOutWeb[]>([]);
    const [loadingLists, setLoadingLists] = useState(true);
    const [listsError, setListsError] = useState("");

    // --- выбранный список ---
    const [rawListId, setRawListId] = useState("");
    const [listRoles, setListRoles] = useState<AdminListRoleUsersOutWeb[]>([]);
    const [loadingListRoles, setLoadingListRoles] = useState(false);
    const [listRolesError, setListRolesError] = useState("");

    // --- черновик изменения ---
    const [draft, setDraft] = useState<DraftChange>(emptyDraft);
    const [roleDrafts, setRoleDrafts] = useState<Record<string, RoleDraft>>({});
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleOwner, setNewRoleOwner] = useState("");
    const [newRoleOwnerNull, setNewRoleOwnerNull] = useState(true);
    const [newRoleValue, setNewRoleValue] = useState("0");

    // --- batch ---
    const [batch, setBatch] = useState<AdminListRawChangeItem[]>([]);
    const [applyingRaw, setApplyingRaw] = useState(false);

    // ------------------------------------------------------------------ загрузка глобальных списков

    const loadGlobalLists = useCallback(
        async (signal?: AbortSignal) => {
            setLoadingLists(true);
            setListsError("");

            try {
                const response = await adminListAppAdminApi.getGlobalAdminLists({ signal });

                setGlobalLists(response);
            } catch (error) {
                if ((error as Error).message === "canceled") return;

                setListsError(convertErrorResponseToString(error));
            } finally {
                if (!signal?.aborted) setLoadingLists(false);
            }
        },
        [adminListAppAdminApi]
    );

    useEffect(() => {
        const controller = new AbortController();

        void loadGlobalLists(controller.signal);

        return () => controller.abort();
    }, [loadGlobalLists]);

    // ------------------------------------------------------------------ загрузка ролей выбранного списка

    const loadListRoles = useCallback(
        async (listId: number, signal?: AbortSignal) => {
            setLoadingListRoles(true);
            setListRolesError("");
            setListRoles([]);

            try {
                const response = await adminListAppAdminApi.getListRoles(listId, { signal });

                setListRoles(response);
            } catch (error) {
                if ((error as Error).message === "canceled") return;

                setListRolesError(convertErrorResponseToString(error));
            } finally {
                if (!signal?.aborted) setLoadingListRoles(false);
            }
        },
        [adminListAppAdminApi]
    );

    useEffect(() => {
        const listId = Number(rawListId);

        if (!rawListId.trim() || !Number.isInteger(listId)) {
            setListRoles([]);
            setListRolesError("");
            return;
        }

        const controller = new AbortController();

        void loadListRoles(listId, controller.signal);

        return () => controller.abort();
    }, [rawListId, loadListRoles]);

    // ------------------------------------------------------------------ инвалидация кеша

    const initUser = async () => {
        const id = initUserId.trim();

        if (!id) return;

        setInitializingUser(true);

        try {
            await adminListAppAdminApi.initUser(id);
            toast({ title: `Пользователь ${id} инициализирован`, type: "success" });
        } catch (error) {
            toast({
                title: "Не удалось инициализировать пользователя",
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setInitializingUser(false);
        }
    };

    const invalidateAllCache = async () => {
        setInvalidatingAll(true);

        try {
            await adminListAppAdminApi.invalidateCache();
            toast({ title: "Кеш admin list очищен", type: "success" });
        } catch (error) {
            toast({
                title: "Не удалось очистить кеш",
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setInvalidatingAll(false);
        }
    };

    const invalidateUserCache = async () => {
        const id = cacheUserId.trim();

        if (!id) return;

        setInvalidatingUser(true);

        try {
            await adminListAppAdminApi.invalidateUserCache(id);
            toast({ title: `Кеш пользователя ${id} очищен`, type: "success" });
        } catch (error) {
            toast({
                title: "Не удалось очистить кеш пользователя",
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setInvalidatingUser(false);
        }
    };

    // ------------------------------------------------------------------ черновик

    const roleRows = useMemo<RoleRow[]>(() => {
        return draft.roles.map((role) => ({
            name: role.name,
            value: role.value,
            activeBefore: null,
            declared: false,
            grantedBy: role.owner,
            owned: false,
        }));
    }, [draft.roles]);

    const fillFromList = () => {
        const targetId = draft.targetUserIdNull ? null : draft.targetUserId.trim() || null;
        const roles = rolesForUser(listRoles, targetId);

        if (roles.length === 0) {
            toast({
                title: "Роли не найдены",
                description:
                    targetId === null
                        ? "В списке нет записей с userId = null."
                        : `В списке нет записей для пользователя ${targetId}.`,
                type: "warning",
            });
            return;
        }

        setDraft((prev) => ({ ...prev, roles }));
        setRoleDrafts({});
    };

    const addRole = () => {
        const name = newRoleName.trim();

        if (!name) {
            toast({ title: "Укажите имя роли", type: "error" });
            return;
        }

        if (draft.roles.some((role) => role.name === name)) {
            toast({ title: "Роль уже добавлена", type: "error" });
            return;
        }

        const parsedValue = Number(newRoleValue);

        if (!Number.isFinite(parsedValue)) {
            toast({ title: "Некорректное значение", type: "error" });
            return;
        }

        const owner = newRoleOwnerNull ? null : newRoleOwner.trim() || null;

        setDraft((prev) => ({
            ...prev,
            roles: [...prev.roles, { name, owner, value: parsedValue }],
        }));
        setNewRoleName("");
        setNewRoleValue("0");
    };

    const handleDraftChange = (roleName: string, next: RoleDraft) => {
        setRoleDrafts((prev) => ({ ...prev, [roleName]: next }));
        setDraft((prev) => ({
            ...prev,
            roles: prev.roles.map((role) => {
                if (role.name !== roleName) return role;

                const numeric = typeof next.value === "number" ? next.value : 0;

                return { ...role, value: numeric };
            }),
        }));
    };

    const handleResetRow = (roleName: string) => {
        setRoleDrafts((prev) => {
            const copy = { ...prev };
            delete copy[roleName];
            return copy;
        });
    };

    const handleRemoveRole = (role: RoleRow) => {
        setDraft((prev) => ({
            ...prev,
            roles: prev.roles.filter((item) => item.name !== role.name),
        }));
        setRoleDrafts((prev) => {
            const copy = { ...prev };
            delete copy[role.name];
            return copy;
        });
    };

    // ------------------------------------------------------------------ batch

    const accumulateChange = () => {
        if (!draft.targetUserIdNull && !draft.targetUserId.trim()) {
            toast({ title: "Укажите targetUserId или отметьте null", type: "error" });
            return;
        }

        const roles: AdminListRawRoleItem[] = draft.roles.map((role) => ({
            owner: role.owner,
            name: role.name,
            value: role.value,
        }));

        const change: AdminListRawChangeItem = {
            targetUserId: draft.targetUserIdNull ? (null as unknown as string) : draft.targetUserId.trim(),
            purge: draft.purge,
            roles: roles.length > 0 ? roles : null,
        };

        setBatch((prev) => [...prev, change]);
        setDraft(emptyDraft());
        setRoleDrafts({});
    };

    const removeBatchItem = (index: number) => {
        setBatch((prev) => prev.filter((_, i) => i !== index));
    };

    const applyBatch = async () => {
        const listIdNum = Number(rawListId);

        if (!Number.isInteger(listIdNum)) {
            toast({ title: "Некорректный id списка", type: "error" });
            return;
        }

        if (batch.length === 0) {
            toast({ title: "Нет накопленных изменений", type: "error" });
            return;
        }

        setApplyingRaw(true);

        const payload: AdminListRawChangesInWeb = { changes: batch };

        try {
            await adminListAppAdminApi.applyRawChanges(listIdNum, payload);
            toast({ title: `Изменения применены к списку #${listIdNum}`, type: "success" });
            setBatch([]);
        } catch (error) {
            toast({
                title: "Не удалось применить изменения",
                description: convertErrorResponseToString(error),
                type: "error",
                time: 10000,
            });
        } finally {
            setApplyingRaw(false);
        }
    };

    // ------------------------------------------------------------------ render

    const listRolesLoaded = !loadingListRoles && listRoles.length > 0;

    const userOptions = useMemo<DropdownItemProps[]>(() => {
        if (!listRolesLoaded) return [];

        const seen = new Set<string>();
        const items: DropdownItemProps[] = [];

        for (const roleEntry of listRoles) {
            for (const user of roleEntry.users ?? []) {
                const key = user.userId ?? "__null__";

                if (!seen.has(key)) {
                    seen.add(key);
                    items.push({
                        key,
                        value: key,
                        text: user.userId === null || user.userId === undefined ? "null" : user.userId,
                    });
                }
            }
        }

        items.sort((a, b) => String(a.text).localeCompare(String(b.text)));

        return items;
    }, [listRoles, listRolesLoaded]);

    return (
        <div className="admin-list-app-admin admin-list-details">
            <Header as="h1">Admin list — прикладной администратор</Header>
            <p>
                Управление кешем admin list и прямое редактирование глобальных списков через
                специальные ручки прикладного администратора.
            </p>

            {/* ===== инициализация пользователя ===== */}
            <Segment color="green">
                <Header as="h2" dividing>Инициализация пользователя</Header>
                <Form>
                    <Form.Field>
                        <label>Инициализировать пользователя</label>
                        <Input
                            action={{
                                content: "Инициализировать",
                                disabled: initializingUser || !initUserId.trim(),
                                loading: initializingUser,
                                color: "green",
                                onClick: () => { void initUser(); },
                            }}
                            onChange={(_, data) => setInitUserId((data.value as string) || "")}
                            placeholder="User id"
                            type="number"
                            value={initUserId}
                        />
                    </Form.Field>
                </Form>
            </Segment>

            {/* ===== кеш ===== */}
            <Segment color="orange">
                <Header as="h2" dividing>Инвалидация кеша</Header>
                <p>
                    Сбрасывает кеш admin list в ghost-сервисе. Используйте после ручных изменений
                    в БД или при подозрении на расхождение состояния.
                </p>

                <Form>
                    <Form.Field>
                        <Button
                            color="orange"
                            content="Сбросить весь кеш"
                            disabled={invalidatingAll}
                            loading={invalidatingAll}
                            onClick={() => { void invalidateAllCache(); }}
                            type="button"
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Сбросить кеш пользователя</label>
                        <Input
                            action={{
                                content: "Сбросить",
                                disabled: invalidatingUser || !cacheUserId.trim(),
                                loading: invalidatingUser,
                                onClick: () => { void invalidateUserCache(); },
                            }}
                            onChange={(_, data) => setCacheUserId((data.value as string) || "")}
                            placeholder="User id"
                            type="number"
                            value={cacheUserId}
                        />
                    </Form.Field>
                </Form>
            </Segment>

            {/* ===== глобальные списки ===== */}
            <Segment color="teal">
                <Header as="h2" dividing>Глобальные списки</Header>
                <div style={{ marginBottom: "0.75em" }}>
                    <Button
                        basic
                        content="Обновить"
                        icon="refresh"
                        loading={loadingLists}
                        onClick={() => { void loadGlobalLists(); }}
                        type="button"
                    />
                </div>

                {listsError && (
                    <Message error>
                        <Message.Header>Не удалось загрузить глобальные списки</Message.Header>
                        <p>{listsError}</p>
                    </Message>
                )}

                {loadingLists ? (
                    <Loader active inline="centered" />
                ) : globalLists.length === 0 ? (
                    <Message info>Глобальные списки отсутствуют.</Message>
                ) : (
                    <List divided relaxed>
                        {globalLists.map((list) => (
                            <List.Item key={list.id ?? `${list.listTypeId}-${list.sourceUserId}`}>
                                <List.Content>
                                    <List.Header>
                                        Список #{list.id ?? "?"}
                                        {list.listTypeId !== undefined && <> · тип {list.listTypeId}</>}
                                    </List.Header>
                                    <List.Description>
                                        {list.parentListInstanceId != null && <>Родитель: #{list.parentListInstanceId}. </>}
                                        {list.sourceUserId && <>Источник: {list.sourceUserId}. </>}
                                        {list.comment?.trim() && <>{list.comment.trim()}</>}
                                    </List.Description>
                                    <Button
                                        basic
                                        compact
                                        content="Выбрать"
                                        onClick={() => setRawListId(String(list.id ?? ""))}
                                        size="mini"
                                        style={{ marginTop: "0.5em" }}
                                        type="button"
                                    />
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                )}
            </Segment>

            {/* ===== raw-изменения ===== */}
            <Segment color="blue">
                <Header as="h2" dividing>Raw-изменения</Header>

                <Form>
                    <Form.Field>
                        <label>Id списка</label>
                        <Input
                            icon={loadingListRoles ? "spinner" : listRolesLoaded ? "check" : undefined}
                            loading={loadingListRoles}
                            onChange={(_, data) => setRawListId((data.value as string) || "")}
                            placeholder="Id"
                            value={rawListId}
                        />
                        {listRolesLoaded && (
                            <Message info size="mini" style={{ marginTop: "0.4em" }}>
                                Загружено ролей: {listRoles.length}. Данные будут использованы для инициализации таблицы.
                            </Message>
                        )}
                        {listRolesError && (
                            <Message error size="small" style={{ marginTop: "0.5em" }}>
                                <Message.Header>Не удалось загрузить роли списка</Message.Header>
                                <p>{listRolesError}</p>
                            </Message>
                        )}
                    </Form.Field>

                    <Divider />

                    <Header as="h3" dividing>Текущее изменение</Header>

                    {userOptions.length > 0 && (
                        <Form.Field>
                            <label>Выбрать пользователя из списка</label>
                            <Dropdown
                                clearable
                                disabled={draft.targetUserIdNull}
                                fluid
                                onChange={(_, data) => {
                                    const selected = data.value as string | undefined;

                                    if (!selected) {
                                        setDraft((prev) => ({ ...prev, targetUserId: "" }));
                                        return;
                                    }

                                    const isNull = selected === "__null__";

                                    setDraft((prev) => ({
                                        ...prev,
                                        targetUserIdNull: isNull,
                                        targetUserId: isNull ? "" : selected,
                                    }));
                                }}
                                options={userOptions}
                                placeholder="Поиск по userId..."
                                search
                                selection
                                value={
                                    draft.targetUserIdNull
                                        ? "__null__"
                                        : draft.targetUserId || undefined
                                }
                            />
                        </Form.Field>
                    )}

                    <Form.Group>
                        <Form.Field width={6}>
                            <label>Target user id</label>
                            <Input
                                disabled={draft.targetUserIdNull}
                                onChange={(_, data) => {
                                    setDraft((prev) => ({
                                        ...prev,
                                        targetUserId: (data.value as string) || "",
                                    }));
                                }}
                                placeholder="User id"
                                type="number"
                                value={draft.targetUserIdNull ? "" : draft.targetUserId}
                            />
                        </Form.Field>
                        <Form.Field width={3} style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.4em" }}>
                            <Checkbox
                                checked={draft.targetUserIdNull}
                                label="null"
                                onChange={(_, data) => {
                                    setDraft((prev) => ({ ...prev, targetUserIdNull: !!data.checked }));
                                }}
                            />
                        </Form.Field>
                        <Form.Field width={3} style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.4em" }}>
                            <Checkbox
                                checked={draft.purge}
                                label="purge"
                                onChange={(_, data) => {
                                    setDraft((prev) => ({ ...prev, purge: !!data.checked }));
                                }}
                            />
                        </Form.Field>
                        <Form.Field width={4} style={{ display: "flex", alignItems: "flex-end" }}>
                            <Button
                                basic
                                content="Заполнить из списка"
                                disabled={!listRolesLoaded}
                                fluid
                                icon="download"
                                onClick={fillFromList}
                                title={
                                    listRolesLoaded
                                        ? "Инициализировать роли текущими значениями из выбранного списка"
                                        : "Сначала выберите список с загруженными ролями"
                                }
                                type="button"
                            />
                        </Form.Field>
                    </Form.Group>

                    <Header as="h4">Добавить роль</Header>
                    <Form.Group>
                        <Form.Input
                            label="Имя роли"
                            onChange={(_, data) => setNewRoleName((data.value as string) || "")}
                            placeholder="ROLE_NAME"
                            value={newRoleName}
                            width={5}
                        />
                        <Form.Input
                            disabled={newRoleOwnerNull}
                            label="Owner"
                            onChange={(_, data) => setNewRoleOwner((data.value as string) || "")}
                            placeholder="Owner user id"
                            value={newRoleOwnerNull ? "" : newRoleOwner}
                            width={4}
                        />
                        <Form.Field width={2} style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.4em" }}>
                            <Checkbox
                                checked={newRoleOwnerNull}
                                label="null"
                                onChange={(_, data) => setNewRoleOwnerNull(!!data.checked)}
                            />
                        </Form.Field>
                        <Form.Input
                            label="Value"
                            onChange={(_, data) => setNewRoleValue((data.value as string) || "")}
                            type="number"
                            value={newRoleValue}
                            width={3}
                        />
                        <Form.Field width={2} style={{ display: "flex", alignItems: "flex-end" }}>
                            <Button
                                content="Добавить"
                                fluid
                                icon="plus"
                                onClick={addRole}
                                primary
                                type="button"
                            />
                        </Form.Field>
                    </Form.Group>
                </Form>

                {roleRows.length > 0 && (
                    <AdminListRolesTable
                        getRoleDeleteRestriction={() => ""}
                        getRoleRestriction={() => ""}
                        isApplyingChanges={applyingRaw}
                        listMode="SET"
                        onDraftChange={handleDraftChange}
                        onMarkForDeletion={handleRemoveRole}
                        onResetRow={handleResetRow}
                        roleDrafts={roleDrafts}
                        roleRows={roleRows}
                        useNumericValue
                    />
                )}

                <div style={{ marginTop: "1em" }}>
                    <Button
                        content="Добавить в batch"
                        icon="save"
                        onClick={accumulateChange}
                        primary
                        type="button"
                    />
                </div>
            </Segment>

            {/* ===== накопленные изменения ===== */}
            <Segment color="violet">
                <Header as="h2" dividing>
                    Накопленные изменения
                    <Label circular style={{ marginLeft: "0.5em" }}>
                        {batch.length}
                    </Label>
                </Header>

                {batch.length === 0 ? (
                    <Message info>Изменения ещё не добавлены.</Message>
                ) : (
                    <List divided relaxed>
                        {batch.map((change, index) => (
                            <List.Item key={index}>
                                <List.Content floated="right">
                                    <Button
                                        basic
                                        color="red"
                                        icon="trash"
                                        onClick={() => removeBatchItem(index)}
                                        size="mini"
                                        type="button"
                                    />
                                </List.Content>
                                <List.Content>
                                    <List.Header>
                                        {change.targetUserId === null ? (
                                            <em>targetUserId = null</em>
                                        ) : (
                                            <>Пользователь: {change.targetUserId}</>
                                        )}
                                        {change.purge && (
                                            <Label color="red" size="mini" style={{ marginLeft: "0.5em" }}>
                                                purge
                                            </Label>
                                        )}
                                    </List.Header>
                                    <List.Description>
                                        {change.roles && change.roles.length > 0 ? (
                                            <>
                                                Роли:{" "}
                                                {change.roles.map((role, i) => (
                                                    <Label key={i} basic size="tiny" style={{ marginRight: "0.25em" }}>
                                                        {role.name} = {role.value}
                                                        {role.owner != null && (
                                                            <Label.Detail>owner: {role.owner}</Label.Detail>
                                                        )}
                                                    </Label>
                                                ))}
                                            </>
                                        ) : (
                                            <em>Без ролей</em>
                                        )}
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                )}

                <div style={{ marginTop: "1em", display: "flex", gap: "0.5em", flexWrap: "wrap" }}>
                    <Button
                        content="Применить batch"
                        disabled={applyingRaw || batch.length === 0 || !rawListId.trim()}
                        icon="paper plane"
                        loading={applyingRaw}
                        onClick={() => { void applyBatch(); }}
                        positive
                        type="button"
                    />
                    <Button
                        basic
                        content="Очистить batch"
                        disabled={batch.length === 0 || applyingRaw}
                        onClick={() => setBatch([])}
                        type="button"
                    />
                </div>
            </Segment>
        </div>
    );
}

export default AdminListAppAdminPage;
