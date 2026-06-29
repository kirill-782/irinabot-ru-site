import React, { useContext } from "react";
import { Button, Header, Icon, Label, Table } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { BanlistEntryOutWeb } from "../../models/rest/Banlist";
import { BanlistEntryColumnKey } from "../../utils/BanlistEntryColumns";
import {
    formatBanlistDate,
    formatDuration,
    formatExpire,
    getActivationInfo,
} from "../../utils/BanlistUtils";
import UserIdLabel from "../AdminList/UserIdLabel";
import BanlistActionText from "./BanlistActionText";
import BanlistSubjectLabel from "./BanlistSubjectLabel";

interface BanlistEntryRowProps {
    entry: BanlistEntryOutWeb;
    templateName?: string;
    // INSERT — без него запись доступна только для чтения
    canModify: boolean;
    // видима ли колонка (синхронно с заголовками таблицы)
    isColumnVisible: (key: BanlistEntryColumnKey) => boolean;
    isToggling: boolean;
    isDeleting: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    // открыть подробный просмотр записи (доступно при праве просмотра)
    onOpenDetails: () => void;
}

function BanlistEntryRow(props: BanlistEntryRowProps) {
    const {
        entry,
        templateName,
        canModify,
        isColumnVisible,
        isToggling,
        isDeleting,
        onToggle,
        onEdit,
        onDelete,
        onOpenDetails,
    } = props;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const isExpired =
        entry.expireAt !== null &&
        entry.expireAt !== undefined &&
        new Date(entry.expireAt).getTime() <= Date.now();

    const activation = getActivationInfo(entry);

    return (
        <Table.Row className={entry.enabled ? undefined : "row-disabled"}>
            {isColumnVisible("id") && (
                <Table.Cell collapsing>
                    <code className="entry-id">
                        {entry.id !== undefined ? `#${entry.id}` : "—"}
                    </code>
                </Table.Cell>
            )}
            <Table.Cell collapsing>
                {canModify ? (
                    <Button
                        basic={entry.enabled}
                        icon
                        loading={isToggling}
                        onClick={onToggle}
                        size="mini"
                        title={
                            entry.enabled
                                ? t("banlistEntriesToggleOff")
                                : t("banlistEntriesToggleOn")
                        }
                    >
                        <Icon
                            color={entry.enabled ? "green" : "grey"}
                            name={entry.enabled ? "toggle on" : "toggle off"}
                        />
                    </Button>
                ) : (
                    <Icon
                        color={entry.enabled ? "green" : "grey"}
                        name={entry.enabled ? "toggle on" : "toggle off"}
                        title={entry.enabled ? t("banlistEntriesToggleOn") : t("banlistEntriesToggleOff")}
                    />
                )}
            </Table.Cell>
            {isColumnVisible("subject") && (
                <Table.Cell>
                    <BanlistSubjectLabel subject={entry.subject} />
                </Table.Cell>
            )}
            {isColumnVisible("action") && (
                <Table.Cell>
                    <BanlistActionText action={entry.action} />
                </Table.Cell>
            )}
            {isColumnVisible("reason") && (
                <Table.Cell>
                    <Header
                        as="h5"
                        className="reason"
                        style={{ margin: 0 }}
                        title={entry.reason || undefined}
                    >
                        {entry.reason ? entry.reason : <i>{t("banlistNoReason")}</i>}
                    </Header>
                </Table.Cell>
            )}
            {isColumnVisible("tag") && (
                <Table.Cell>
                    {entry.tag ? (
                        <Label basic size="mini">#{entry.tag}</Label>
                    ) : (
                        "—"
                    )}
                </Table.Cell>
            )}
            {isColumnVisible("template") && (
                <Table.Cell>
                    {entry.templateId !== null && entry.templateId !== undefined ? (
                        <Label basic size="tiny">
                            {templateName || `#${entry.templateId}`}
                        </Label>
                    ) : (
                        "—"
                    )}
                </Table.Cell>
            )}
            {isColumnVisible("activation") && (
                <Table.Cell>
                    {activation.status === "immediate" && (
                        <span className="activation-immediate">
                            {t("banlistEntriesActivationImmediate")}
                        </span>
                    )}
                    {activation.status === "pending" && (
                        <span>
                            {t("banlistDeferredFrom", {
                                duration: formatDuration(t, activation.deferredSeconds),
                            })}
                        </span>
                    )}
                    {activation.status === "triggered" && (
                        <span
                            className="activation-triggered"
                            title={t("banlistEntriesActivationTriggered")}
                        >
                            <Icon color="green" name="check circle" />
                            {formatBanlistDate(activation.triggeredAt)}
                        </span>
                    )}
                </Table.Cell>
            )}
            {isColumnVisible("expire") && (
                <Table.Cell>
                    <Header as="h5" disabled={isExpired} style={{ margin: 0 }}>
                        {formatExpire(t, entry)}
                        <Header.Subheader>
                            {t("banlistEntriesCreatedAt", {
                                date: formatBanlistDate(entry.createdAt),
                            })}
                        </Header.Subheader>
                    </Header>
                </Table.Cell>
            )}
            {isColumnVisible("issuer") && (
                <Table.Cell>
                    {entry.issuedByUserId || entry.issuedByTechnicalAccount ? (
                        <>
                            {entry.issuedByUserId && <UserIdLabel userId={entry.issuedByUserId} />}
                            {entry.issuedByTechnicalAccount && (
                                <Icon
                                    color="grey"
                                    name="microchip"
                                    style={{ marginLeft: entry.issuedByUserId ? 4 : 0 }}
                                    title={t("banlistEntryTechnicalIssuer")}
                                />
                            )}
                        </>
                    ) : (
                        "—"
                    )}
                </Table.Cell>
            )}
            <Table.Cell textAlign="right">
                <Button
                    basic
                    icon="eye"
                    onClick={onOpenDetails}
                    size="mini"
                    title={t("banlistEntryDetailsButton")}
                />
                {canModify && (
                    <>
                        <Button basic icon="edit" onClick={onEdit} size="mini" />
                        <Button
                            basic
                            color="red"
                            icon="trash"
                            loading={isDeleting}
                            onClick={onDelete}
                            size="mini"
                        />
                    </>
                )}
            </Table.Cell>
        </Table.Row>
    );
}

export default BanlistEntryRow;
