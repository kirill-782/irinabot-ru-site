import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button, Form, Header, Icon, Message, Modal, Segment } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { useBanlistSubject } from "../../hooks/useBanlistSubject";
import {
    BanlistIncrementResultOutWeb,
    BanlistViolationTemplateOutWeb,
} from "../../models/rest/Banlist";
import { BanlistService } from "../../services/BanlistService";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import { actionLongLabel, subjectString } from "../../utils/BanlistUtils";
import BanlistSubjectFields from "./BanlistSubjectFields";

interface BanlistIncrementModalProps {
    open: boolean;
    banlistId: number;
    banlistApi: BanlistService;
    templates: BanlistViolationTemplateOutWeb[];
    onClose: () => void;
    // запись могла быть создана/обновлена инкрементом — даём родителю перезагрузить список
    onSuccess?: () => void | Promise<void>;
}

function BanlistIncrementModal(props: BanlistIncrementModalProps) {
    const { open, banlistId, banlistApi, templates, onClose, onSuccess } = props;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [templateId, setTemplateId] = useState<number | null>(null);
    const subject = useBanlistSubject();

    const [isSubmitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [result, setResult] = useState<BanlistIncrementResultOutWeb | null>(null);

    useEffect(() => {
        if (!open) return;

        // единственный шаблон выбираем сразу
        setTemplateId(templates.length === 1 ? templates[0].id ?? null : null);
        subject.reset();
        setErrorMessage("");
        setResult(null);
        setSubmitting(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const templateOptions = useMemo(
        () =>
            templates.map((template) => ({
                key: template.id ?? 0,
                value: template.id ?? 0,
                text: template.name || `#${template.id}`,
            })),
        [templates]
    );

    const handleSubmit = async () => {
        setErrorMessage("");

        if (templateId === null) {
            setErrorMessage(t("banlistIncrementTemplateRequired"));
            return;
        }

        const subjectError = subject.validate();
        if (subjectError) {
            setErrorMessage(subjectError);
            return;
        }

        setSubmitting(true);

        try {
            const response = await banlistApi.incrementViolation(banlistId, templateId, {
                subject: subject.buildSubject(),
            });
            setResult(response);
            // запись могла быть создана/обновлена — обновляем список под модалкой
            await onSuccess?.();
        } catch (error) {
            setErrorMessage(convertErrorResponseToString(error));
        } finally {
            setSubmitting(false);
        }
    };

    const submitDisabled = templateId === null || subject.validate() !== null;

    return (
        <Modal onClose={onClose} open={open} size="small">
            <Modal.Header>{t("banlistIncrementHeader")}</Modal.Header>
            <Modal.Content>
                {templates.length === 0 ? (
                    <Message info>{t("banlistIncrementNoTemplates")}</Message>
                ) : (
                    <Form>
                        <Form.Dropdown
                            label={t("banlistIncrementTemplateLabel")}
                            onChange={(_, data) =>
                                setTemplateId(typeof data.value === "number" ? data.value : null)
                            }
                            options={templateOptions}
                            placeholder={t("banlistIncrementTemplatePlaceholder")}
                            selection
                            value={templateId ?? undefined}
                        />

                        <Header as="h4">{t("banlistSubjectHeader")}</Header>

                        <BanlistSubjectFields radioName="incrementSubjectMode" subject={subject} />
                    </Form>
                )}

                {errorMessage && <Message error>{errorMessage}</Message>}

                {result && (
                    <Segment>
                        <Header as="h4">{t("banlistIncrementResultHeader")}</Header>
                        <p>
                            {t("banlistIncrementViolationCount", {
                                count: result.violationCount ?? 0,
                            })}
                        </p>
                        <p>
                            {t("banlistIncrementLastGraduated", {
                                count: result.lastGraduatedCount ?? 0,
                            })}
                        </p>
                        {result.action && (
                            <p>
                                {t("banlistActionHeader")}: {actionLongLabel(t, result.action)}
                            </p>
                        )}
                        {result.suppressed ? (
                            <Message warning>
                                <Icon name="shield" />
                                {t("banlistIncrementSuppressed")}
                            </Message>
                        ) : result.createdEntry ? (
                            <Message positive>
                                <Icon name="gavel" />
                                {t("banlistIncrementTriggered", {
                                    subject: subjectString(result.createdEntry.subject),
                                })}
                            </Message>
                        ) : result.action === "NOTIFY" ? (
                            <Message info>
                                <Icon name="bell outline" />
                                {t("banlistIncrementNotify")}
                            </Message>
                        ) : (
                            <Message info>{t("banlistIncrementNotTriggered")}</Message>
                        )}
                    </Segment>
                )}
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>{t("close")}</Button>
                {templates.length > 0 && (
                    <Button
                        disabled={submitDisabled}
                        loading={isSubmitting}
                        onClick={() => void handleSubmit()}
                        primary
                    >
                        <Icon name="level up alternate" />
                        {t("banlistIncrementSubmit")}
                    </Button>
                )}
            </Modal.Actions>
        </Modal>
    );
}

export default BanlistIncrementModal;
