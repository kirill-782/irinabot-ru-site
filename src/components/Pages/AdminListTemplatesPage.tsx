import React, { useContext, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    Button,
    Card,
    Container,
    Header,
    Icon,
    Label,
    Loader,
    Message,
    Segment,
} from "semantic-ui-react";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { useTitle } from "../../hooks/useTitle";
import { useAdminList } from "../../hooks/useAdminList";
import { useAdminListTemplates } from "../../hooks/useAdminListTemplates";
import { useConfirmAction } from "../../hooks/useConfirmAction";
import { AdminListTemplateOutWeb } from "../../models/rest/AdminList";
import { ADMIN_LIST_MANAGE_ROLE, hasOwnedListRole } from "../../utils/AdminListUtils";
import AdminListCard from "../AdminList/AdminListCard";
import AdminListTemplateEditor from "../AdminList/AdminListTemplateEditor";
import MetaRobots from "../Meta/MetaRobots";

function AdminListTemplatesPage() {
    const params = useParams();
    const listId = Number(params.id);
    const { adminListApi } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const { data: listData, isLoading: isListLoading } = useAdminList(listId);
    const {
        templates,
        isLoading: isTemplatesLoading,
        errorMessage,
        reload,
    } = useAdminListTemplates(listId);

    const [editing, setEditing] = useState<AdminListTemplateOutWeb | null>(null);
    const [isCreating, setCreating] = useState(false);

    const deleteAction = useConfirmAction();

    useTitle(Number.isFinite(listId) ? `Admin list #${listId} — templates` : "Admin list templates");

    const canManage = useMemo(
        () => hasOwnedListRole(listData?.roles, ADMIN_LIST_MANAGE_ROLE),
        [listData?.roles]
    );

    const backLink = `/admin-list/${listId}`;

    const handleDelete = (template: AdminListTemplateOutWeb) => {
        const templateId = template.id;
        if (templateId === undefined) return;

        void deleteAction.run(
            templateId,
            () => adminListApi.deleteAdminListTemplate(listId, templateId),
            {
                confirm: t("adminListTemplateDeleteConfirm", { name: template.name || `#${templateId}` }),
                success: t("adminListTemplateDeletedToast"),
                error: t("adminListTemplateDeleteFailedToast"),
                onSuccess: reload,
            }
        );
    };

    const handleEditorClose = async (shouldReload?: boolean) => {
        setEditing(null);
        setCreating(false);
        if (shouldReload) await reload();
    };

    if (!Number.isFinite(listId)) {
        return (
            <Container className="extra">
                <MetaRobots noIndex />
                <Message error>
                    <Message.Header>{t("adminListErrorInvalidId")}</Message.Header>
                    <p>{t("adminListErrorInvalidIdDesc")}</p>
                </Message>
            </Container>
        );
    }

    if ((isCreating || editing) && listData) {
        return (
            <Container className="extra">
                <MetaRobots noIndex />
                <AdminListTemplateEditor
                    listId={listId}
                    list={listData}
                    adminListApi={adminListApi}
                    template={editing}
                    onClose={handleEditorClose}
                />
            </Container>
        );
    }

    return (
        <Container className="extra">
            <MetaRobots noIndex />

            <div className="toolbar">
                <Button as={Link} basic size="small" to={backLink}>
                    <Icon name="arrow left" />
                    {t("adminListTemplatesBackToList")}
                </Button>
            </div>

            {listData && <AdminListCard list={listData} listId={listId} />}

            <div className="toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Header as="h2" style={{ margin: 0 }}>
                    {t("adminListTemplatesTitle")}
                </Header>
                {canManage && (
                    <Button onClick={() => setCreating(true)} primary type="button">
                        <Icon name="plus" />
                        {t("adminListTemplatesNew")}
                    </Button>
                )}
            </div>

            {!canManage && <Message info>{t("adminListTemplatesReadOnlyNote")}</Message>}

            {errorMessage && (
                <Message error>
                    <Message.Header>{t("adminListTemplatesLoadFailed")}</Message.Header>
                    <p>{errorMessage}</p>
                </Message>
            )}

            {isTemplatesLoading || isListLoading ? (
                <Segment>
                    <Loader active inline="centered" />
                </Segment>
            ) : templates.length === 0 ? (
                <Message info>{t("adminListTemplatesEmpty")}</Message>
            ) : (
                <Card.Group doubling itemsPerRow={3} stackable>
                    {templates.map((template) => {
                        const roleCount = template.roles?.length || 0;

                        return (
                            <Card key={template.id}>
                                <Card.Content>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            gap: "0.5em",
                                        }}
                                    >
                                        <Card.Header>{template.name || `#${template.id}`}</Card.Header>
                                        {canManage && (
                                            <div>
                                                <Button
                                                    basic
                                                    icon="edit"
                                                    onClick={() => setEditing(template)}
                                                    size="mini"
                                                />
                                                <Button
                                                    basic
                                                    color="red"
                                                    icon="trash"
                                                    loading={deleteAction.busyId === template.id}
                                                    onClick={() => void handleDelete(template)}
                                                    size="mini"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <Card.Meta>
                                        <Label.Group size="tiny">
                                            <Label basic>
                                                {t("adminListTemplatesRoleCount", { count: String(roleCount) })}
                                            </Label>
                                            {template.privilegeLevel != null && (
                                                <Label basic color="teal">
                                                    {t("adminListTemplatesPrivilegeLabel", {
                                                        level: String(template.privilegeLevel),
                                                    })}
                                                </Label>
                                            )}
                                        </Label.Group>
                                    </Card.Meta>
                                    {template.description?.trim() && (
                                        <Card.Description>{template.description}</Card.Description>
                                    )}
                                </Card.Content>
                            </Card>
                        );
                    })}
                </Card.Group>
            )}

            {deleteAction.confirmModal}
        </Container>
    );
}

export default AdminListTemplatesPage;
