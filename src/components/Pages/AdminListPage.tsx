import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button, Container, Form, Grid, Header, List, Loader, Message, Modal, Segment } from "semantic-ui-react";
import { AuthContext } from "../../context";
import { AdminList, Role, User, UserRoleAssignment } from "../../models/rest/AdminList";
import { AdminService } from "../../services/AdminService";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import { toast } from "@kokomi/react-semantic-toasts";
import { DEFAULT_CONFIG } from "../../config/ApiConfig";
import { AppRuntimeSettingsContext } from "../../context";
function AdminListPage() {
    const { auth } = useContext(AuthContext);
    const currentAuth = auth.currentAuth;
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const adminService = useMemo(() => new AdminService(DEFAULT_CONFIG), []);

    const [adminLists, setAdminLists] = useState<AdminList[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [selectedParentId, setSelectedParentId] = useState<number | undefined>(undefined);

    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedListId, setSelectedListId] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

    const currentUserAssignments = useMemo(() => {
        return adminLists.flatMap((list) => list.assignments).filter((a) => a.userId === parseInt(currentAuth.id));
    }, [adminLists, currentAuth.id]);

    const currentUserRoleIds = useMemo(() => {
        return new Set(currentUserAssignments.map((a) => a.roleId));
    }, [currentUserAssignments]);

    const assignableRoles = useMemo(() => {
        const selectedList = adminLists.find((l) => l.id === selectedListId);
        const declaredRoleNames = new Set(selectedList?.roles.map((r) => r.name) || []);
        const currentUserRoleNames = new Set(
            currentUserAssignments.map((a) => roles.find((r) => r.id === a.roleId)?.name || "")
        );
        return roles.filter((r) => currentUserRoleNames.has(r.name) || declaredRoleNames.has(r.name));
    }, [roles, currentUserAssignments, adminLists, selectedListId]);

    const currentUser = useMemo(() => users.find((u) => u.id === parseInt(currentAuth.id)), [users, currentAuth.id]);
    const targetUser = useMemo(
        () => (selectedUserId ? users.find((u) => u.id === selectedUserId) : null),
        [users, selectedUserId]
    );
    const canAssign = useMemo(() => {
        return !targetUser || !currentUser || targetUser.powerMetric <= currentUser.powerMetric;
    }, [targetUser, currentUser]);

    const loadData = useCallback(async () => {
        if (!currentAuth) return;
        try {
            // Mock data for testing
            const mockLists: AdminList[] = [
                {
                    id: 1,
                    name: "Default List",
                    parentId: null,
                    activeUntil: null,
                    itemsActiveUntil: null,
                    isDefault: true,
                    roles: [
                        { id: 1, name: "Admin", permissions: ["READ", "WRITE"], validUntil: null },
                        { id: 2, name: "User", permissions: ["READ"], validUntil: null },
                    ],
                    assignments: [
                        { id: 1, userId: 1, roleId: 1, assignedBy: 1, assignedAt: new Date(), validUntil: null },
                    ],
                },
                {
                    id: 2,
                    name: "Child List",
                    parentId: 1,
                    activeUntil: new Date(Date.now() + 86400000),
                    itemsActiveUntil: null,
                    isDefault: false,
                    roles: [{ id: 3, name: "Moderator", permissions: ["MODERATE"], validUntil: null }],
                    assignments: [],
                },
            ];
            const mockRoles: Role[] = [
                { id: 1, name: "Admin", permissions: ["READ", "WRITE"], validUntil: null, isDeclared: true },
                { id: 2, name: "User", permissions: ["READ"], validUntil: null, isDeclared: true },
                { id: 3, name: "Moderator", permissions: ["MODERATE"], validUntil: null, isDeclared: false },
            ];
            const mockUsers: User[] = [
                { id: 1, nickname: "TestUser", powerMetric: 100 },
                { id: 2, nickname: "AnotherUser", powerMetric: 50 },
            ];
            setAdminLists(mockLists);
            setRoles(mockRoles);
            setUsers(mockUsers);
            // const lists = await adminService.getAdminLists({ userId: parseInt(currentAuth.id) }, {});
            // const allRoles = await adminService.getRoles({});
            // const allUsers = await adminService.getUsers(undefined, {});
            // setAdminLists(lists);
            // setRoles(allRoles);
            // setUsers(allUsers);
        } catch (err) {
            setError(convertErrorResponseToString(err));
        } finally {
            setLoading(false);
        }
    }, [currentAuth]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (!currentAuth) return <Loader active />;

    const handleCreateList = async () => {
        try {
            const newList: AdminList = {
                id: Date.now(),
                name: newListName,
                parentId: selectedParentId || undefined,
                activeUntil: null,
                itemsActiveUntil: null,
                isDefault: false,
                roles: [],
                assignments: [],
            };
            setAdminLists((prev) => [...prev, newList]);
            setCreateModalOpen(false);
            setNewListName("");
            setSelectedParentId(null);
            toast({ title: "Success", description: lang.adminListPageToastCreated, type: "success" });
            // await adminService.createAdminList({ name: newListName, parentId: selectedParentId || undefined }, {});
            // loadData();
            setCreateModalOpen(false);
            setNewListName("");
            setSelectedParentId(null);
        } catch (err) {
            toast({ title: "Error", description: convertErrorResponseToString(err), type: "error" });
        }
    };

    const handleAssignRole = async () => {
        if (!selectedListId || !selectedUserId || !selectedRoleId || !canAssign) return;
        const role = roles.find((r) => r.name === selectedRoleId);
        if (!role) return;
        try {
            const newAssignment: UserRoleAssignment = {
                id: Date.now(),
                userId: selectedUserId,
                roleId: role.id,
                assignedBy: parseInt(currentAuth.id),
                assignedAt: new Date(),
                validUntil: null,
            };
            setAdminLists((prev) =>
                prev.map((list) =>
                    list.id === selectedListId ? { ...list, assignments: [...list.assignments, newAssignment] } : list
                )
            );
            await adminService.assignRole({ adminListId: selectedListId, userId: selectedUserId, roleId: role.id }, {});
            loadData();
            setAssignModalOpen(false);
            setSelectedListId(null);
            setSelectedUserId(null);
            setSelectedRoleId(null);
            toast({ title: "Success", description: lang.adminListPageToastAssigned, type: "success" });
        } catch (err) {
            toast({ title: "Error", description: convertErrorResponseToString(err), type: "error" });
        }
    };

    const handleRemoveAssignment = async (assignmentId: number) => {
        try {
            setAdminLists((prev) =>
                prev.map((list) => ({
                    ...list,
                    assignments: list.assignments.filter((a) => a.id !== assignmentId),
                }))
            );
            // await adminService.removeAssignment({ assignmentId }, {});
            // loadData();
            toast({ title: "Success", description: lang.adminListPageToastRemoved, type: "success" });
        } catch (err) {
            toast({ title: "Error", description: convertErrorResponseToString(err), type: "error" });
        }
    };

    if (loading) return <Loader active />;

    if (error) return <Message error>{error}</Message>;

    return (
        <Container>
            <Header as="h1">{lang.adminListPageTitle}</Header>
            <Button primary onClick={() => setCreateModalOpen(true)} style={{ marginTop: "1em", marginBottom: "1em" }}>
                {lang.adminListPageCreateNewList}
            </Button>
            <Grid>
                {adminLists.map((list) => (
                    <Grid.Column key={list.id} width={8}>
                        <Segment>
                            <Header as="h3">
                                {list.name} {list.isDefault && lang.adminListPageDefault}
                            </Header>
                            <p>
                                {lang.adminListPageActiveUntil}:{" "}
                                {list.activeUntil
                                    ? new Date(list.activeUntil).toLocaleString()
                                    : lang.adminListPageForever}
                            </p>
                            <p>
                                {lang.adminListPageItemsActiveUntil}:{" "}
                                {list.itemsActiveUntil
                                    ? new Date(list.itemsActiveUntil).toLocaleString()
                                    : lang.adminListPageForever}
                            </p>
                            <Header as="h4">{lang.adminListPageRoles}</Header>
                            <List>
                                {list.roles.map((role) => (
                                    <List.Item key={role.id}>
                                        {role.name} - {lang.adminListPagePermissions}: {role.permissions.join(", ")}
                                    </List.Item>
                                ))}
                            </List>
                            <Header as="h4">{lang.adminListPageAssignments}</Header>
                            <List>
                                {list.assignments.map((assignment) => (
                                    <List.Item key={assignment.id}>
                                        {lang.adminListPageUser}:{" "}
                                        {users.find((u) => u.id === assignment.userId)?.nickname} -{" "}
                                        {lang.adminListPageRole}: {roles.find((r) => r.id === assignment.roleId)?.name}
                                        {assignment.assignedBy === parseInt(currentAuth.id) && (
                                            <Button
                                                size="mini"
                                                color="red"
                                                onClick={() => handleRemoveAssignment(assignment.id)}
                                            >
                                                {lang.adminListPageRemove}
                                            </Button>
                                        )}
                                    </List.Item>
                                ))}
                            </List>
                            <Button
                                onClick={() => {
                                    setSelectedListId(list.id);
                                    setAssignModalOpen(true);
                                }}
                            >
                                {lang.adminListPageAssignRole}
                            </Button>
                        </Segment>
                    </Grid.Column>
                ))}
            </Grid>

            <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                <Modal.Header>{lang.adminListPageModalCreateHeader}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Input
                            label={lang.adminListPageModalCreateNameLabel}
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                        />
                        <Form.Dropdown
                            label={lang.adminListPageModalCreateParentLabel}
                            placeholder={lang.adminListPageModalCreateParentPlaceholder}
                            fluid
                            selection
                            options={adminLists.map((l) => ({ key: l.id, text: l.name, value: l.id }))}
                            value={selectedParentId}
                            onChange={(e, { value }) => setSelectedParentId(value as number)}
                        />
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setCreateModalOpen(false)}>{lang.adminListPageModalCreateCancel}</Button>
                    <Button primary onClick={handleCreateList}>
                        {lang.adminListPageModalCreateCreate}
                    </Button>
                </Modal.Actions>
            </Modal>

            <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)}>
                <Modal.Header>{lang.adminListPageModalAssignHeader}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Dropdown
                            label={lang.adminListPageModalAssignUserLabel}
                            placeholder={lang.adminListPageModalAssignUserPlaceholder}
                            fluid
                            selection
                            options={users.map((u) => ({ key: u.id, text: u.nickname, value: u.id }))}
                            value={selectedUserId}
                            onChange={(e, { value }) => setSelectedUserId(value as number)}
                        />
                        <Form.Dropdown
                            label={lang.adminListPageModalAssignRoleLabel}
                            placeholder={lang.adminListPageModalAssignRolePlaceholder}
                            fluid
                            selection
                            options={assignableRoles.map((r) => ({ key: r.name, text: r.name, value: r.name }))}
                            value={selectedRoleId}
                            onChange={(e, { value }) => setSelectedRoleId(value as string)}
                        />
                    </Form>
                    {targetUser && currentUser && targetUser.powerMetric > currentUser.powerMetric && (
                        <Message warning>{lang.adminListPagePowerMetricWarning}</Message>
                    )}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setAssignModalOpen(false)}>{lang.adminListPageModalAssignCancel}</Button>
                    <Button primary onClick={handleAssignRole} disabled={!canAssign}>
                        {lang.adminListPageModalAssignAssign}
                    </Button>
                </Modal.Actions>
            </Modal>
        </Container>
    );
}

export default AdminListPage;
