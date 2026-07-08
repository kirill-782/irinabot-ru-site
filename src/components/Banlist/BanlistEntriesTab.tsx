import React, { useContext, useMemo, useState } from "react";
import { Button, Icon, Loader, Message, Segment, Table } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { useBanlistEntryColumns } from "../../hooks/useBanlistEntryColumns";
import { UseBanlistEntriesFilterResult } from "../../hooks/useBanlistEntriesFilter";
import { useConfirmAction } from "../../hooks/useConfirmAction";
import { useClampPage } from "../../hooks/usePagination";
import { useResolveConnectorIds } from "../../hooks/useResolveConnectorIds";
import { BanlistEntryOutWeb, BanlistViolationTemplateOutWeb } from "../../models/rest/Banlist";
import { BanlistService } from "../../services/BanlistService";
import { subjectString } from "../../utils/BanlistUtils";
import BanlistColumnsModal from "./BanlistColumnsModal";
import BanlistEntriesFilters from "./BanlistEntriesFilters";
import BanlistEntryForm from "./BanlistEntryForm";
import BanlistEntryRow from "./BanlistEntryRow";
import BanlistIncrementModal from "./BanlistIncrementModal";
import BanlistPaginationFooter from "./BanlistPaginationFooter";

import "./BanlistEntriesTab.scss";

interface BanlistEntriesTabProps {
    banlistId: number;
    banlistApi: BanlistService;
    // текущая страница записей (серверная фильтрация/пагинация)
    entries: BanlistEntryOutWeb[];
    // общее число записей под фильтром (X-Total-Count)
    total: number;
    filter: UseBanlistEntriesFilterResult;
    templates: BanlistViolationTemplateOutWeb[];
    templateTags: string[];
    restrictEntryTags?: boolean;
    // INSERT — прямое добавление/правка/удаление записей
    canInsert: boolean;
    // VIOLATIONS_TRACK — выдача из шаблона и инкременты нарушений
    canTrackViolations: boolean;
    isLoading: boolean;
    errorMessage: string;
    onReload: () => Promise<void> | void;
    // открыть подробный просмотр записи по её id (deep-link через адресную строку)
    onOpenEntryDetails: (entryId: number) => void;
}

function BanlistEntriesTab(props: BanlistEntriesTabProps) {
    const {
        banlistId,
        banlistApi,
        entries,
        total,
        filter,
        templates,
        templateTags,
        restrictEntryTags,
        canInsert,
        canTrackViolations,
        isLoading,
        errorMessage,
        onReload,
        onOpenEntryDetails,
    } = props;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const deleteAction = useConfirmAction();
    const toggleAction = useConfirmAction();

    const [showForm, setShowForm] = useState(false);
    const [showIncrement, setShowIncrement] = useState(false);
    const [showColumns, setShowColumns] = useState(false);
    const [editingEntry, setEditingEntry] = useState<BanlistEntryOutWeb | null>(null);

    // видимость колонок таблицы (сохраняется в localStorage этого браузера)
    const columns = useBanlistEntryColumns();

    // резолвим ники субъектов-userId и выдавших бан одним батчем, чтобы в колонках
    // «Субъект» и «Выдавший» показывались имена, а не #id
    useResolveConnectorIds(
        useMemo(
            () =>
                entries.flatMap((entry) => [
                    entry.subject?.matchUserId,
                    entry.issuedByUserId,
                ]),
            [entries]
        )
    );

    const templateNameById = useMemo(() => {
        const map = new Map<number, string>();
        templates.forEach((template) => {
            if (template.id !== undefined) {
                map.set(template.id, template.name || `#${template.id}`);
            }
        });
        return map;
    }, [templates]);

    // пустой результат при активном фильтре/поиске — это «ничего не найдено», а не «список пуст»
    const hasActiveFilters =
        filter.search.trim() !== "" ||
        filter.actionFilter !== "all" ||
        filter.statusFilter !== "all" ||
        filter.templateFilter !== "all" ||
        filter.tagFilter !== "all";

    // страница уехала за пределы выборки (например, удалили последнюю запись) — подвинуть назад
    useClampPage({
        page: filter.page,
        setPage: filter.setPage,
        total,
        pageSize: filter.pageSize,
        currentCount: entries.length,
        isLoading,
    });

    const handleToggle = (entry: BanlistEntryOutWeb) => {
        const entryId = entry.id;
        if (entryId === undefined) return;

        void toggleAction.run(
            entryId,
            () => banlistApi.patchEntry(banlistId, entryId, { enabled: !entry.enabled }),
            { error: t("banlistEntryUpdateFailedToast"), onSuccess: onReload }
        );
    };

    const handleDelete = (entry: BanlistEntryOutWeb) => {
        const entryId = entry.id;
        if (entryId === undefined) return;

        void deleteAction.run(entryId, () => banlistApi.deleteEntry(banlistId, entryId), {
            confirm: t("banlistEntryDeleteConfirm", { subject: subjectString(entry.subject) }),
            success: t("banlistEntryDeletedToast"),
            error: t("banlistEntryDeleteFailedToast"),
            onSuccess: onReload,
        });
    };

    const handleFormSuccess = async () => {
        const wasCreating = !editingEntry;
        setShowForm(false);
        setEditingEntry(null);

        // новая запись попадает на первую страницу (сортировка createdAt desc)
        if (wasCreating && filter.page !== 0) {
            filter.setPage(0); // смена страницы сама перезагрузит список
        } else {
            await onReload();
        }
    };

    if (showForm) {
        return (
            <BanlistEntryForm
                banlistId={banlistId}
                banlistApi={banlistApi}
                canInsert={canInsert}
                templates={templates}
                restrictEntryTags={restrictEntryTags}
                entry={editingEntry}
                onCancel={() => {
                    setShowForm(false);
                    setEditingEntry(null);
                }}
                onSuccess={handleFormSuccess}
            />
        );
    }

    return (
        <div className="banlist-entries-tab">
            <div className="toolbar">
                <BanlistEntriesFilters
                    filter={filter}
                    templates={templates}
                    templateTags={templateTags}
                />
                <div className="actions">
                    {canTrackViolations && (
                        <>
                            <Button
                                onClick={() => {
                                    setEditingEntry(null);
                                    setShowForm(true);
                                }}
                                primary
                                size="small"
                            >
                                <Icon name="plus" />
                                {t("banlistEntriesAdd")}
                            </Button>
                            <Button onClick={() => setShowIncrement(true)} size="small">
                                <Icon name="level up alternate" />
                                {t("banlistIncrementButton")}
                            </Button>
                        </>
                    )}
                    <Button
                        basic
                        icon
                        loading={isLoading}
                        onClick={() => void onReload()}
                        size="small"
                        title={t("banlistEntriesRefresh")}
                    >
                        <Icon name="refresh" />
                    </Button>
                    <Button
                        basic
                        icon
                        onClick={() => setShowColumns(true)}
                        size="small"
                        title={t("banlistColumnsButton")}
                    >
                        <Icon name="columns" />
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <Message error>
                    <Message.Header>{t("banlistEntriesLoadFailed")}</Message.Header>
                    <p>{errorMessage}</p>
                </Message>
            )}

            {isLoading ? (
                <Segment>
                    <Loader active inline="centered" />
                </Segment>
            ) : entries.length === 0 ? (
                <Message info>
                    {hasActiveFilters ? t("banlistEntriesNoMatch") : t("banlistEntriesEmpty")}
                </Message>
            ) : (
                <Table basic="very" compact="very">
                    <Table.Header>
                        <Table.Row>
                            {columns.isVisible("id") && (
                                <Table.HeaderCell collapsing>
                                    {t("banlistEntriesHeaderNumber")}
                                </Table.HeaderCell>
                            )}
                            <Table.HeaderCell collapsing />
                            {columns.isVisible("subject") && (
                                <Table.HeaderCell>{t("banlistSubjectHeader")}</Table.HeaderCell>
                            )}
                            {columns.isVisible("matching") && (
                                <Table.HeaderCell collapsing textAlign="center">
                                    {t("banlistEntriesHeaderMatching")}
                                </Table.HeaderCell>
                            )}
                            {columns.isVisible("action") && (
                                <Table.HeaderCell>{t("banlistActionHeader")}</Table.HeaderCell>
                            )}
                            {columns.isVisible("reason") && (
                                <Table.HeaderCell>{t("banlistReasonHeader")}</Table.HeaderCell>
                            )}
                            {columns.isVisible("tag") && (
                                <Table.HeaderCell>{t("banlistTagHeader")}</Table.HeaderCell>
                            )}
                            {columns.isVisible("template") && (
                                <Table.HeaderCell>{t("banlistEntriesHeaderTemplate")}</Table.HeaderCell>
                            )}
                            {columns.isVisible("activation") && (
                                <Table.HeaderCell>{t("banlistEntriesHeaderActivation")}</Table.HeaderCell>
                            )}
                            {columns.isVisible("expire") && (
                                <Table.HeaderCell>{t("banlistExpireHeader")}</Table.HeaderCell>
                            )}
                            {columns.isVisible("issuer") && (
                                <Table.HeaderCell>{t("banlistEntriesHeaderIssuer")}</Table.HeaderCell>
                            )}
                            <Table.HeaderCell textAlign="right">{t("actions")}</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {entries.map((entry) => (
                            <BanlistEntryRow
                                canModify={canInsert}
                                entry={entry}
                                isColumnVisible={columns.isVisible}
                                isDeleting={deleteAction.busyId === entry.id}
                                isToggling={toggleAction.busyId === entry.id}
                                key={entry.id}
                                onDelete={() => void handleDelete(entry)}
                                onEdit={() => {
                                    setEditingEntry(entry);
                                    setShowForm(true);
                                }}
                                onOpenDetails={() => {
                                    if (entry.id !== undefined) onOpenEntryDetails(entry.id);
                                }}
                                onToggle={() => void handleToggle(entry)}
                                templateName={
                                    entry.templateId !== null && entry.templateId !== undefined
                                        ? templateNameById.get(entry.templateId)
                                        : undefined
                                }
                            />
                        ))}
                    </Table.Body>
                </Table>
            )}

            <BanlistPaginationFooter
                onPageChange={filter.setPage}
                onPageSizeChange={filter.setPageSize}
                page={filter.page}
                pageSize={filter.pageSize}
                shownCount={entries.length}
                total={total}
            />

            <BanlistIncrementModal
                banlistApi={banlistApi}
                banlistId={banlistId}
                onClose={() => setShowIncrement(false)}
                onSuccess={onReload}
                open={showIncrement}
                templates={templates}
            />

            <BanlistColumnsModal
                columns={columns}
                onClose={() => setShowColumns(false)}
                open={showColumns}
            />

            {deleteAction.confirmModal}
        </div>
    );
}

export default BanlistEntriesTab;
