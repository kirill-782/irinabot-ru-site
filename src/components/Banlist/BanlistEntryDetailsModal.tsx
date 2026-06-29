import React, { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import { Button, Icon, Label, Loader, Message, Modal, Table } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { useResolveConnectorIds } from "../../hooks/useResolveConnectorIds";
import { BanlistEntryOutWeb, BanlistViolationTemplateOutWeb } from "../../models/rest/Banlist";
import { BanlistService } from "../../services/BanlistService";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import {
    formatBanlistDate,
    formatDuration,
    formatExpire,
    getActivationInfo,
    subjectString,
} from "../../utils/BanlistUtils";
import { GetLanguageStaring } from "../../hooks/useLanguage";
import UserIdLabel from "../AdminList/UserIdLabel";
import BanlistActionText from "./BanlistActionText";

const MUTED_STYLE: React.CSSProperties = { color: "var(--muted-text-color)" };

interface BanlistEntryDetailsModalProps {
    open: boolean;
    banlistId: number;
    // null — модалка закрыта; число — какую запись грузить
    entryId: number | null;
    banlistApi: BanlistService;
    // для резолва имени шаблона записи (опционально — иначе показываем #id)
    templates?: BanlistViolationTemplateOutWeb[];
    onClose: () => void;
}

function DetailRow(props: { label: string; children: React.ReactNode }) {
    return (
        <Table.Row>
            <Table.Cell collapsing>{props.label}</Table.Cell>
            <Table.Cell>{props.children}</Table.Cell>
        </Table.Row>
    );
}

function renderActivation(t: GetLanguageStaring, entry: BanlistEntryOutWeb): React.ReactNode {
    const activation = getActivationInfo(entry);

    if (activation.status === "immediate") {
        return t("banlistEntriesActivationImmediate");
    }

    if (activation.status === "pending") {
        return t("banlistDeferredFrom", {
            duration: formatDuration(t, activation.deferredSeconds),
        });
    }

    return (
        <span title={t("banlistEntriesActivationTriggered")}>
            <Icon color="green" name="check circle" />
            {formatBanlistDate(activation.triggeredAt)}
        </span>
    );
}

function BanlistEntryDetailsModal(props: BanlistEntryDetailsModalProps) {
    const { open, banlistId, entryId, banlistApi, templates, onClose } = props;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [entry, setEntry] = useState<BanlistEntryOutWeb | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!open || entryId === null) return;

        const controller = new AbortController();

        setLoading(true);
        setErrorMessage("");
        setEntry(null);

        banlistApi
            .getEntry(banlistId, entryId, { signal: controller.signal })
            .then((data) => setEntry(data))
            .catch((error) => {
                if ((error as Error).message === "canceled") return;
                setErrorMessage(convertErrorResponseToString(error));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [open, banlistId, entryId, banlistApi]);

    // подтягиваем ники для субъекта и выдавшего, чтобы UserIdLabel показал их вместо #id
    useResolveConnectorIds(
        useMemo(
            () => [entry?.subject?.matchUserId, entry?.issuedByUserId],
            [entry?.subject?.matchUserId, entry?.issuedByUserId]
        )
    );

    const templateName = useMemo(() => {
        const templateId = entry?.templateId;
        if (templateId === null || templateId === undefined) return null;

        const found = templates?.find((template) => template.id === templateId);
        return found?.name || `#${templateId}`;
    }, [entry?.templateId, templates]);

    const technicalProps = useMemo(
        () => (entry?.technicalProperties ? Object.entries(entry.technicalProperties) : []),
        [entry?.technicalProperties]
    );

    const subject = entry?.subject;

    const handleCopyLink = () => {
        if (!navigator.clipboard) return;

        void navigator.clipboard.writeText(window.location.href).then(() => {
            toast({ title: t("banlistEntryDetailsLinkCopied"), type: "success" });
        });
    };

    return (
        <Modal onClose={onClose} open={open} size="small">
            <Modal.Header>
                {entryId !== null
                    ? t("banlistEntryDetailsHeader", { id: entryId })
                    : t("banlistEntryDetailsHeaderFallback")}
            </Modal.Header>
            <Modal.Content scrolling>
                {isLoading && <Loader active inline="centered" />}

                {errorMessage && (
                    <Message error>
                        <Message.Header>{t("banlistEntryDetailsLoadFailed")}</Message.Header>
                        <p>{errorMessage}</p>
                    </Message>
                )}

                {entry && !isLoading && (
                    <Table basic="very" definition>
                        <Table.Body>
                            <DetailRow label={t("banlistEntryDetailsStatus")}>
                                <Label color={entry.enabled ? "green" : "grey"} size="small">
                                    <Icon name={entry.enabled ? "toggle on" : "toggle off"} />
                                    {entry.enabled
                                        ? t("banlistEntriesToggleOn")
                                        : t("banlistEntriesToggleOff")}
                                </Label>
                            </DetailRow>

                            <DetailRow label={t("banlistSubjectHeader")}>
                                <code>{subjectString(subject)}</code>
                            </DetailRow>

                            {subject?.matchUserId && (
                                <DetailRow label="userId">
                                    <UserIdLabel userId={subject.matchUserId} />{" "}
                                    <span style={MUTED_STYLE}>({subject.matchUserId})</span>
                                </DetailRow>
                            )}

                            {(subject?.matchPvpgnRealm || subject?.matchPvpgnName) && (
                                <DetailRow label="PvPGN">
                                    {(subject?.matchPvpgnRealm || "?") +
                                        " / " +
                                        (subject?.matchPvpgnName || "?")}
                                </DetailRow>
                            )}

                            {subject?.matchIpCidr && (
                                <DetailRow label="IP (CIDR)">
                                    <code>{subject.matchIpCidr}</code>
                                </DetailRow>
                            )}

                            {subject?.matchHardwareId && (
                                <DetailRow label="Hardware ID">
                                    <code>{subject.matchHardwareId}</code>
                                </DetailRow>
                            )}

                            <DetailRow label={t("banlistActionHeader")}>
                                <BanlistActionText action={entry.action} />
                            </DetailRow>

                            <DetailRow label={t("banlistReasonHeader")}>
                                {entry.reason ? entry.reason : <i>{t("banlistNoReason")}</i>}
                            </DetailRow>

                            <DetailRow label={t("banlistTagHeader")}>
                                {entry.tag ? (
                                    <Label basic size="mini">
                                        #{entry.tag}
                                    </Label>
                                ) : (
                                    "—"
                                )}
                            </DetailRow>

                            <DetailRow label={t("banlistEntriesHeaderTemplate")}>
                                {templateName ? (
                                    <Label basic size="tiny">
                                        {templateName}
                                    </Label>
                                ) : (
                                    "—"
                                )}
                            </DetailRow>

                            <DetailRow label={t("banlistEntryDetailsIssuer")}>
                                {entry.issuedByUserId ? (
                                    <UserIdLabel userId={entry.issuedByUserId} />
                                ) : (
                                    <i>{t("banlistEntryFormIssuerUnknown")}</i>
                                )}
                                {entry.issuedByTechnicalAccount && (
                                    <Label size="mini" style={{ marginLeft: 6 }}>
                                        <Icon name="microchip" />
                                        {t("banlistEntryFormIssuerTechnical")}
                                    </Label>
                                )}
                            </DetailRow>

                            {technicalProps.length > 0 && (
                                <DetailRow label={t("banlistEntryDetailsTechnicalProps")}>
                                    <Table basic="very" compact="very" size="small">
                                        <Table.Body>
                                            {technicalProps.map(([key, value]) => (
                                                <Table.Row key={key}>
                                                    <Table.Cell collapsing>
                                                        <code>{key}</code>
                                                    </Table.Cell>
                                                    <Table.Cell>{value}</Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                </DetailRow>
                            )}

                            <DetailRow label={t("banlistEntriesHeaderActivation")}>
                                {renderActivation(t, entry)}
                            </DetailRow>

                            {(entry.deferredDurationSeconds || entry.deferredDuration) && (
                                <DetailRow label={t("banlistEntryDetailsDeferred")}>
                                    {formatDuration(
                                        t,
                                        getActivationInfo(entry).deferredSeconds
                                    )}
                                </DetailRow>
                            )}

                            {entry.firstTriggeredAt && (
                                <DetailRow label={t("banlistEntryDetailsFirstTriggered")}>
                                    {formatBanlistDate(entry.firstTriggeredAt)}
                                </DetailRow>
                            )}

                            <DetailRow label={t("banlistExpireHeader")}>
                                {formatExpire(t, entry)}
                                {entry.expireAt !== null && entry.expireAt !== undefined && (
                                    <span style={MUTED_STYLE}>
                                        {" "}
                                        ({formatBanlistDate(entry.expireAt)})
                                    </span>
                                )}
                            </DetailRow>

                            <DetailRow label={t("banlistEntryDetailsCreatedAt")}>
                                {formatBanlistDate(entry.createdAt)}
                            </DetailRow>

                            <DetailRow label={t("banlistEntryDetailsUpdatedAt")}>
                                {formatBanlistDate(entry.updatedAt)}
                            </DetailRow>

                            <DetailRow label={t("banlistEntryDetailsId")}>
                                <code>{entry.id}</code>
                                {subject?.id !== undefined && (
                                    <span style={MUTED_STYLE}>
                                        {" "}
                                        · {t("banlistEntryDetailsSubjectId")}:{" "}
                                        <code>{subject.id}</code>
                                    </span>
                                )}
                            </DetailRow>
                        </Table.Body>
                    </Table>
                )}
            </Modal.Content>
            <Modal.Actions>
                {navigator.clipboard && (
                    <Button basic icon labelPosition="left" onClick={handleCopyLink}>
                        <Icon name="linkify" />
                        {t("banlistEntryDetailsCopyLink")}
                    </Button>
                )}
                <Button onClick={onClose}>{t("close")}</Button>
            </Modal.Actions>
        </Modal>
    );
}

export default BanlistEntryDetailsModal;
