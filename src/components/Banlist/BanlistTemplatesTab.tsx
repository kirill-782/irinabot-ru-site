import React, { useContext, useState } from "react";
import {
    Button,
    Card,
    Header,
    Icon,
    Label,
    Loader,
    Message,
    Segment,
} from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { useConfirmAction } from "../../hooks/useConfirmAction";
import { BanlistViolationTemplateOutWeb } from "../../models/rest/Banlist";
import { BanlistService } from "../../services/BanlistService";
import {
    describeReset,
    durationFromTemplateField,
    formatDuration,
    sortGraduation,
} from "../../utils/BanlistUtils";
import BanlistActionText from "./BanlistActionText";
import BanlistTemplateEditor from "./BanlistTemplateEditor";

import "./BanlistTemplatesTab.scss";

interface BanlistTemplatesTabProps {
    banlistId: number;
    banlistApi: BanlistService;
    templates: BanlistViolationTemplateOutWeb[];
    // MANAGE — создавать/редактировать/удалять шаблоны
    canManage: boolean;
    isLoading: boolean;
    errorMessage: string;
    onReload: () => Promise<void> | void;
}

function BanlistTemplatesTab(props: BanlistTemplatesTabProps) {
    const { banlistId, banlistApi, templates, canManage, isLoading, errorMessage, onReload } = props;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [editing, setEditing] = useState<BanlistViolationTemplateOutWeb | null>(null);
    const [isCreating, setCreating] = useState(false);

    const deleteAction = useConfirmAction();

    const handleDelete = (template: BanlistViolationTemplateOutWeb) => {
        const templateId = template.id;
        if (templateId === undefined) return;

        void deleteAction.run(
            templateId,
            () => banlistApi.deleteTemplate(banlistId, templateId),
            {
                confirm: t("banlistTemplateDeleteConfirm", { name: template.name }),
                success: t("banlistTemplateDeletedToast"),
                error: t("banlistTemplateDeleteFailedToast"),
                onSuccess: onReload,
            }
        );
    };

    const handleEditorClose = async (reload?: boolean) => {
        setEditing(null);
        setCreating(false);
        if (reload) await onReload();
    };

    if (isCreating || editing) {
        return (
            <BanlistTemplateEditor
                banlistId={banlistId}
                banlistApi={banlistApi}
                template={editing}
                onClose={handleEditorClose}
            />
        );
    }

    return (
        <div className="banlist-templates-tab">
            <div className="toolbar">
                <Header as="h4" sub>
                    {t("banlistTemplatesHint")}
                </Header>
                {canManage && (
                    <Button onClick={() => setCreating(true)} primary>
                        <Icon name="plus" />
                        {t("banlistTemplatesNew")}
                    </Button>
                )}
            </div>

            {errorMessage && (
                <Message error>
                    <Message.Header>{t("banlistTemplatesLoadFailed")}</Message.Header>
                    <p>{errorMessage}</p>
                </Message>
            )}

            {isLoading ? (
                <Segment>
                    <Loader active inline="centered" />
                </Segment>
            ) : templates.length === 0 ? (
                <Message info>{t("banlistTemplatesEmpty")}</Message>
            ) : (
                <Card.Group className="card-grid">
                    {templates.map((template) => {
                        const steps = sortGraduation(template.graduation || []);
                        return (
                            <Card key={template.id}>
                                <Card.Content>
                                    <div className="card-header">
                                        <div>
                                            <Card.Header>
                                                {template.name || `#${template.id}`}
                                            </Card.Header>
                                            <Card.Meta className="card-meta">
                                                <span className="card-reset">
                                                    {t("banlistTemplatesResetLabel", {
                                                        value: describeReset(t, template),
                                                    })}
                                                </span>
                                            </Card.Meta>
                                        </div>
                                        <div className="card-actions">
                                            {template.tag && (
                                                <Label basic size="mini">
                                                    #{template.tag}
                                                </Label>
                                            )}
                                            {canManage && (
                                                <>
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
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {template.reason && (
                                        <Card.Description>
                                            {template.reason}
                                        </Card.Description>
                                    )}

                                    <div className="grad">
                                        {steps.length === 0 ? (
                                            <Message size="mini" warning>
                                                {t("banlistTemplatesGradMissing")}
                                            </Message>
                                        ) : (
                                            <div className="grad-rows">
                                                {steps.map((step, index) => {
                                                    const expireSeconds = durationFromTemplateField(
                                                        step.expireDurationSeconds,
                                                        step.expireDuration
                                                    );
                                                    const deferredSeconds = durationFromTemplateField(
                                                        step.deferredDurationSeconds,
                                                        step.deferredDuration
                                                    );
                                                    return (
                                                        <div
                                                            className="grad-row"
                                                            key={index}
                                                        >
                                                            <span className="grad-threshold">
                                                                ≥{step.minCount}
                                                            </span>
                                                            <BanlistActionText
                                                                action={step.action}
                                                            />
                                                            <span className="grad-duration">
                                                                {step.action !== "WARNING" &&
                                                                    step.action !== "NONE" &&
                                                                    (expireSeconds !== null
                                                                        ? formatDuration(
                                                                              t,
                                                                              expireSeconds
                                                                          )
                                                                        : t(
                                                                              "banlistDurationForever"
                                                                          ))}
                                                            </span>
                                                            <span className="grad-deferred">
                                                                {deferredSeconds !== null && (
                                                                    <>
                                                                        <Icon name="hourglass half" />
                                                                        {t("banlistDeferredFrom", {
                                                                            duration: formatDuration(
                                                                                t,
                                                                                deferredSeconds
                                                                            ),
                                                                        })}
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </Card.Content>
                            </Card>
                        );
                    })}
                </Card.Group>
            )}

            {deleteAction.confirmModal}
        </div>
    );
}

export default BanlistTemplatesTab;
