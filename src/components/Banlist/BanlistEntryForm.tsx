import React, { useContext, useMemo, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import { Button, Form, Header, Icon, Message, Segment } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { useBanlistSubject } from "../../hooks/useBanlistSubject";
import {
    BanlistAction,
    BanlistEntryInWeb,
    BanlistEntryOutWeb,
    BanlistEntryPutInWeb,
    BanlistSubjectPatchInWeb,
    BanlistViolationTemplateOutWeb,
} from "../../models/rest/Banlist";
import { BanlistService } from "../../services/BanlistService";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import {
    buildDurationPayload,
    buildResetUnitOptions,
    DurationUnit,
    secondsToDuration,
} from "../../utils/BanlistTemplateDraft";
import {
    actionLongLabel,
    BANLIST_ACTIONS,
    durationFromTemplateField,
    getDefaultGraduationLevel,
} from "../../utils/BanlistUtils";
import BanlistDurationField from "./BanlistDurationField";
import BanlistSubjectFields from "./BanlistSubjectFields";
import Markdown from "../Markdown";

import "./BanlistEntryForm.scss";

interface BanlistEntryFormProps {
    banlistId: number;
    banlistApi: BanlistService;
    templates: BanlistViolationTemplateOutWeb[];
    // restrictEntryTagsToTemplates банлиста: тег записи — только из тегов шаблонов
    restrictEntryTags?: boolean;
    // INSERT — без него доступна только выдача из шаблона (VIOLATIONS_TRACK)
    canInsert?: boolean;
    entry?: BanlistEntryOutWeb | null;
    onCancel: () => void;
    onSuccess: () => void | Promise<void>;
}

type ExpireMode = "forever" | "date";

function toDateTimeLocal(value?: number | null): string {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const pad = (n: number) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDateTimeLocal(value: string): number | null {
    if (!value.trim()) return null;

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return null;

    return parsed.getTime();
}

const normalizeOptional = (value?: string | null): string => value?.trim() || "";

function BanlistEntryForm(props: BanlistEntryFormProps) {
    const {
        banlistId,
        banlistApi,
        templates,
        restrictEntryTags,
        canInsert = true,
        entry,
        onCancel,
        onSuccess,
    } = props;
    const isEdit = !!entry;

    // Без права INSERT новую запись можно создать только из шаблона (VIOLATIONS_TRACK).
    const templateRequired = !canInsert && !isEdit;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const deferredUnitOptions = useMemo(() => buildResetUnitOptions(t), [t]);

    const initialExpireMode: ExpireMode = entry?.expireAt ? "date" : "forever";

    const initialDeferredSeconds = useMemo(
        () =>
            durationFromTemplateField(
                entry?.deferredDurationSeconds,
                entry?.deferredDuration
            ),
        [entry]
    );

    const initialDeferredEnabled = !!initialDeferredSeconds && !entry?.firstTriggeredAt;

    const initialDeferred = useMemo<{ value: string; unit: DurationUnit }>(() => {
        if (initialDeferredSeconds) return secondsToDuration(initialDeferredSeconds);
        return { value: "7", unit: "days" };
    }, [initialDeferredSeconds]);

    const subject = useBanlistSubject(entry?.subject);

    const [action, setAction] = useState<BanlistAction>(entry?.action || "WARNING");
    const [reason, setReason] = useState(entry?.reason || "");
    const [tag, setTag] = useState(entry?.tag || "");

    const [expireMode, setExpireMode] = useState<ExpireMode>(initialExpireMode);
    const [expireAt, setExpireAt] = useState(toDateTimeLocal(entry?.expireAt));
    const [deferredEnabled, setDeferredEnabled] = useState(initialDeferredEnabled);
    const [deferredValue, setDeferredValue] = useState(initialDeferred.value);
    const [deferredUnit, setDeferredUnit] = useState<DurationUnit>(initialDeferred.unit);

    // учитывать вспомогательные измерения субъекта (IP/CIDR, HWID) при проверке /check
    const [matchByIpCidr, setMatchByIpCidr] = useState(!!entry?.matchByIpCidr);
    const [matchByHardwareId, setMatchByHardwareId] = useState(!!entry?.matchByHardwareId);

    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
        entry?.templateId ?? null
    );

    // переписать выдавшего на текущего инициатора при сохранении (только в режиме редактирования)
    const [replaceIssuer, setReplaceIssuer] = useState(false);

    const [isSubmitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // для быстрой выдачи предлагаются только шаблоны с заданным уровнем по умолчанию
    const quickTemplates = useMemo(
        () => templates.filter((template) => getDefaultGraduationLevel(template) !== null),
        [templates]
    );

    const templateTagOptions = useMemo(() => {
        const tags = new Set<string>();

        templates.forEach((template) => {
            const value = template.tag?.trim();
            if (value) tags.add(value);
        });

        // тег записи мог появиться до включения ограничения — не теряем его из списка
        const currentTag = entry?.tag?.trim();
        if (currentTag) tags.add(currentTag);

        return Array.from(tags)
            .sort()
            .map((value) => ({ key: value, value, text: value }));
    }, [templates, entry]);

    const validateSubject = (): string | null => {
        if (isEdit) {
            const nextUserId = subject.subjectMode === "userId" ? subject.userId : null;
            const nextPvpgnRealm = subject.subjectMode === "pvpgn" ? subject.pvpgnRealm : null;
            const nextPvpgnName = subject.subjectMode === "pvpgn" ? subject.pvpgnName : null;

            if (
                normalizeOptional(nextUserId) !== normalizeOptional(entry?.subject?.matchUserId) ||
                normalizeOptional(nextPvpgnRealm) !== normalizeOptional(entry?.subject?.matchPvpgnRealm) ||
                normalizeOptional(nextPvpgnName) !== normalizeOptional(entry?.subject?.matchPvpgnName)
            ) {
                return t("banlistEntryFormSubjectImmutable");
            }

            return null;
        }

        return subject.validate();
    };

    const buildPayload = (): BanlistEntryInWeb | null => {
        const payload: BanlistEntryInWeb = {
            subject: subject.buildSubject(),
            action,
            reason: reason.trim() || null,
            tag: tag.trim() || null,
            expireAt: null,
            deferredDurationSeconds: null,
            matchByIpCidr,
            matchByHardwareId,
        };

        if (expireMode === "date") {
            const ms = fromDateTimeLocal(expireAt);
            if (!ms) {
                setErrorMessage(t("banlistEntryFormInvalidExpireDate"));
                return null;
            }
            payload.expireAt = ms;
        }

        if (deferredEnabled) {
            const deferred = buildDurationPayload(deferredValue, deferredUnit);
            if (deferred.seconds === null) {
                setErrorMessage(t("banlistEntryFormDeferredPositive"));
                return null;
            }
            payload.deferredDurationSeconds = deferred.seconds;
        }

        return payload;
    };

    const buildPutPayload = (payload: BanlistEntryInWeb): BanlistEntryPutInWeb => ({
        enabled: entry?.enabled ?? true,
        action: payload.action,
        reason: payload.reason ?? null,
        tag: payload.tag ?? null,
        expireAt: payload.expireAt ?? null,
        deferredDurationSeconds: payload.deferredDurationSeconds ?? null,
        matchByIpCidr,
        matchByHardwareId,
        ...(replaceIssuer ? { replaceIssuer: true } : {}),
    });

    const buildSubjectPatch = (): BanlistSubjectPatchInWeb | null => {
        if (!isEdit || !entry?.subject?.id) return null;

        const patch: BanlistSubjectPatchInWeb = {};
        const nextIpCidr = subject.ipCidr.trim() || null;
        const nextHardwareId = subject.hardwareId.trim() || null;

        if (normalizeOptional(nextIpCidr) !== normalizeOptional(entry.subject.matchIpCidr)) {
            patch.matchIpCidr = nextIpCidr;
        }

        if (normalizeOptional(nextHardwareId) !== normalizeOptional(entry.subject.matchHardwareId)) {
            patch.matchHardwareId = nextHardwareId;
        }

        return Object.keys(patch).length > 0 ? patch : null;
    };

    const handleSubmit = async () => {
        setErrorMessage("");

        if (templateRequired && selectedTemplateId === null) {
            setErrorMessage(t("banlistEntryFormTemplateRequired"));
            return;
        }

        const subjectError = validateSubject();

        if (subjectError) {
            setErrorMessage(subjectError);
            return;
        }

        const payload = buildPayload();

        if (!payload) return;

        setSubmitting(true);

        try {
            if (isEdit && entry?.id !== undefined) {
                await banlistApi.putEntry(banlistId, entry.id, buildPutPayload(payload));

                const subjectPatch = buildSubjectPatch();
                if (subjectPatch && entry.subject?.id !== undefined) {
                    await banlistApi.patchSubject(banlistId, entry.subject.id, subjectPatch);
                }
                toast({ title: t("banlistEntryUpdatedToast"), type: "success" });
            } else if (selectedTemplateId !== null && !isEdit) {
                await banlistApi.createEntryFromTemplate(banlistId, selectedTemplateId, payload);
                toast({ title: t("banlistEntryCreatedFromTemplateToast"), type: "success" });
            } else {
                await banlistApi.createEntry(banlistId, payload);
                toast({ title: t("banlistEntryCreatedToast"), type: "success" });
            }
        } catch (error) {
            setErrorMessage(convertErrorResponseToString(error));
            return;
        } finally {
            // сбрасываем до onSuccess: после него родитель размонтирует форму
            setSubmitting(false);
        }

        await onSuccess();
    };

    const applyTemplate = (template: BanlistViolationTemplateOutWeb) => {
        const defaultLevel = getDefaultGraduationLevel(template);

        if (!defaultLevel) return;

        setSelectedTemplateId(template.id ?? null);
        setReason(template.reason || "");
        setTag(template.tag || "");
        if (defaultLevel.action) setAction(defaultLevel.action);

        const deferredSeconds = durationFromTemplateField(
            defaultLevel.deferredDurationSeconds,
            defaultLevel.deferredDuration
        );

        if (deferredSeconds) {
            const deferred = secondsToDuration(deferredSeconds);
            setDeferredValue(deferred.value);
            setDeferredUnit(deferred.unit === "forever" ? "days" : deferred.unit);
            setDeferredEnabled(true);
        } else {
            setDeferredEnabled(false);
        }

        const expireSeconds = durationFromTemplateField(
            defaultLevel.expireDurationSeconds,
            defaultLevel.expireDuration
        );

        if (expireSeconds) {
            setExpireMode("date");
            setExpireAt(toDateTimeLocal(Date.now() + expireSeconds * 1000));
        } else {
            setExpireMode("forever");
            setExpireAt("");
        }
    };

    return (
        <div className="banlist-entry-form">
            <div className="form-header">
                <Header as="h3">
                    {isEdit ? t("banlistEntryFormEditHeader") : t("banlistEntryFormNewHeader")}
                </Header>
                <div>
                    <Button onClick={onCancel} type="button">
                        {t("cancel")}
                    </Button>
                    <Button
                        disabled={templateRequired && selectedTemplateId === null}
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

            {templateRequired && (
                <Message info>{t("banlistEntryFormTemplateOnlyNote")}</Message>
            )}

            {!isEdit && quickTemplates.length > 0 && (
                <Segment>
                    <Header as="h4">{t("banlistEntryFormQuickTemplate")}</Header>
                    <div className="template-row">
                        {quickTemplates.map((template) => (
                            <Button
                                basic
                                key={template.id}
                                onClick={() => applyTemplate(template)}
                                primary={selectedTemplateId === template.id}
                                size="small"
                                type="button"
                            >
                                {template.name || `#${template.id}`}
                            </Button>
                        ))}
                        {selectedTemplateId !== null && (
                            <Button
                                basic
                                onClick={() => setSelectedTemplateId(null)}
                                size="small"
                                type="button"
                            >
                                <Icon name="times" />
                                {t("banlistEntryFormResetTemplate")}
                            </Button>
                        )}
                    </div>
                </Segment>
            )}

            <Segment>
                <Header as="h4">
                    {t("banlistSubjectHeader")}
                    <Header.Subheader>
                        <Markdown light>{t("banlistEntryFormSubjectHint")}</Markdown>
                    </Header.Subheader>
                </Header>

                <Form>
                    <BanlistSubjectFields disabled={isEdit} subject={subject} />
                </Form>
            </Segment>

            {isEdit && (
                <Segment>
                    <Header as="h4">
                        {t("banlistEntryFormIssuerHeader")}
                        <Header.Subheader>{t("banlistEntryFormIssuerHint")}</Header.Subheader>
                    </Header>
                    <p>
                        {entry?.issuedByTechnicalAccount
                            ? t("banlistEntryFormIssuerTechnical")
                            : entry?.issuedByUserId
                            ? t("banlistEntryFormIssuerUser", { userId: entry.issuedByUserId })
                            : t("banlistEntryFormIssuerUnknown")}
                    </p>
                    <Form>
                        <Form.Checkbox
                            checked={replaceIssuer}
                            label={t("banlistEntryFormReplaceIssuer")}
                            onChange={(_, data) => setReplaceIssuer(!!data.checked)}
                        />
                        {replaceIssuer && (
                            <Message info size="tiny">
                                {t("banlistEntryFormReplaceIssuerHint")}
                            </Message>
                        )}
                    </Form>
                </Segment>
            )}

            <Segment>
                <Header as="h4">{t("banlistActionHeader")}</Header>
                <Form>
                    <Form.Group inline>
                        {BANLIST_ACTIONS.map((value) => (
                            <Form.Radio
                                checked={action === value}
                                key={value}
                                label={actionLongLabel(t, value)}
                                name="action"
                                onChange={() => setAction(value)}
                            />
                        ))}
                    </Form.Group>

                    <Form.Group widths="equal">
                        <Form.TextArea
                            label={t("banlistReasonHeader")}
                            onChange={(_, data) => setReason(String(data.value || ""))}
                            placeholder={t("banlistEntryFormReasonPlaceholder")}
                            rows={3}
                            value={reason}
                        />
                        {restrictEntryTags ? (
                            <Form.Dropdown
                                clearable
                                label={t("banlistEntryFormTagLabel")}
                                noResultsMessage={t("banlistEntryFormTagNoTemplateTags")}
                                onChange={(_, data) => setTag(String(data.value ?? ""))}
                                options={templateTagOptions}
                                placeholder={t("banlistEntryFormTagRestrictedPlaceholder")}
                                selection
                                value={tag}
                            />
                        ) : (
                            <Form.Input
                                label={t("banlistEntryFormTagLabel")}
                                onChange={(_, data) => setTag(data.value)}
                                placeholder="cheat, spam..."
                                value={tag}
                            />
                        )}
                    </Form.Group>
                </Form>
            </Segment>

            <Segment>
                <Header as="h4">
                    {t("banlistEntryFormExpireHeader")}
                    <Header.Subheader>
                        <Markdown light>{t("banlistEntryFormExpireHint")}</Markdown>
                    </Header.Subheader>
                </Header>
                <Form>
                    <Form.Field>
                        <Form.Radio
                            checked={expireMode === "forever"}
                            label={t("banlistDurationForever")}
                            name="expireMode"
                            onChange={() => setExpireMode("forever")}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Form.Radio
                            checked={expireMode === "date"}
                            label={t("banlistEntryFormExpireDate")}
                            name="expireMode"
                            onChange={() => setExpireMode("date")}
                        />
                        {expireMode === "date" && (
                            <div className="indent">
                                <Form.Input
                                    onChange={(_, data) => setExpireAt(data.value)}
                                    type="datetime-local"
                                    value={expireAt}
                                />
                            </div>
                        )}
                    </Form.Field>
                </Form>
            </Segment>

            <Segment>
                <Header as="h4">
                    {t("banlistEntryFormMatchHeader")}
                    <Header.Subheader>
                        <Markdown light>{t("banlistEntryFormMatchHint")}</Markdown>
                    </Header.Subheader>
                </Header>
                <Form>
                    <Form.Field>
                        <Form.Checkbox
                            checked={matchByIpCidr}
                            label={t("banlistEntryFormMatchByIp")}
                            onChange={(_, data) => setMatchByIpCidr(!!data.checked)}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Form.Checkbox
                            checked={matchByHardwareId}
                            label={t("banlistEntryFormMatchByHardwareId")}
                            onChange={(_, data) => setMatchByHardwareId(!!data.checked)}
                        />
                    </Form.Field>
                </Form>
            </Segment>

            <Segment>
                <Header as="h4">
                    {t("banlistEntryFormDeferredHeader")}
                    <Header.Subheader>
                        <Markdown light>{t("banlistEntryFormDeferredHint")}</Markdown>
                    </Header.Subheader>
                </Header>
                <Form>
                    <Form.Field>
                        <Form.Checkbox
                            checked={deferredEnabled}
                            label={t("banlistEntryFormDeferredEnable")}
                            onChange={(_, data) => setDeferredEnabled(!!data.checked)}
                        />
                    </Form.Field>
                    {deferredEnabled && (
                        <BanlistDurationField
                            className="indent"
                            isoPlaceholder="PT1H, P1D..."
                            onUnitChange={setDeferredUnit}
                            onValueChange={setDeferredValue}
                            options={deferredUnitOptions}
                            unit={deferredUnit}
                            value={deferredValue}
                        />
                    )}
                </Form>
            </Segment>
        </div>
    );
}

export default BanlistEntryForm;
