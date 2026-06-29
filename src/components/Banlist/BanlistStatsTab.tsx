import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Button,
    Dropdown,
    Form,
    Header,
    Input,
    Label,
    Loader,
    Message,
    Modal,
    Segment,
    Table,
} from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { useBanlistTemplateStats } from "../../hooks/useBanlistTemplateStats";
import { useConfirmAction } from "../../hooks/useConfirmAction";
import { useDebounce } from "../../hooks/useDebounce";
import { useClampPage, usePagination } from "../../hooks/usePagination";
import {
    BanlistSubjectInWeb,
    BanlistSubjectOutWeb,
    BanlistViolationStatsOutWeb,
    BanlistViolationStatsPatchInWeb,
    BanlistViolationStatsQueryParams,
    BanlistViolationTemplateOutWeb,
} from "../../models/rest/Banlist";
import { BanlistService } from "../../services/BanlistService";
import { formatBanlistDate, subjectString } from "../../utils/BanlistUtils";
import { runWithToast } from "../../utils/ToastUtils";
import BanlistPaginationFooter from "./BanlistPaginationFooter";

import "./BanlistStatsTab.scss";

interface BanlistStatsTabProps {
    banlistId: number;
    banlistApi: BanlistService;
    templates: BanlistViolationTemplateOutWeb[];
    // VIOLATIONS_TRACK — засчитывать нарушения и завершённые игры (инкременты)
    canTrackViolations: boolean;
    // INSERT — ручная правка/сброс счётчиков статистики
    canInsert: boolean;
    // запись бана могла быть создана/обновлена инкрементом — обновляем счётчик записей у родителя
    onReload?: () => Promise<void> | void;
}

// violation — засчитать нарушение (+1); completedGame — засчитать завершённую игру
// (топливо для ленивого остывания нарушений)
type StatAction = "violation" | "completedGame";

// субъект статистики хранит match-поля — переносим их в тело запроса
const toSubjectIn = (subject?: BanlistSubjectOutWeb): BanlistSubjectInWeb => ({
    matchUserId: subject?.matchUserId ?? null,
    matchPvpgnRealm: subject?.matchPvpgnRealm ?? null,
    matchPvpgnName: subject?.matchPvpgnName ?? null,
    matchIpCidr: subject?.matchIpCidr ?? null,
    matchHardwareId: subject?.matchHardwareId ?? null,
});

// счётчики неотрицательные целые — пустое/мусорное поле трактуем как 0
const toCount = (value: string): number => {
    const parsed = Math.trunc(Number(value));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

function BanlistStatsTab({
    banlistId,
    banlistApi,
    templates,
    canTrackViolations,
    canInsert,
    onReload,
}: BanlistStatsTabProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const resetAction = useConfirmAction();

    const [templateId, setTemplateId] = useState<number | null>(
        templates.length > 0 ? templates[0].id ?? null : null
    );
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 350);
    const { page, setPage, pageSize, setPageSize } = usePagination();
    const [busy, setBusy] = useState<{ id: number; action: StatAction } | null>(null);

    // правка счётчиков выбранной строки
    const [editing, setEditing] = useState<BanlistViolationStatsOutWeb | null>(null);
    const [editViolations, setEditViolations] = useState("0");
    const [editLastGraduated, setEditLastGraduated] = useState("0");
    const [editGames, setEditGames] = useState("0");
    const [savingEdit, setSavingEdit] = useState(false);

    // шаблоны грузятся асинхронно: при первом рендере templateId может остаться null,
    // а если выбранный шаблон удалили — стать невалидным. Привязываем выбор к доступному
    // шаблону, чтобы статистика подгрузилась по умолчанию.
    useEffect(() => {
        if (templates.length === 0) return;
        const exists = templates.some((template) => template.id === templateId);
        if (!exists) setTemplateId(templates[0].id ?? null);
    }, [templates, templateId]);

    // смена шаблона/поиска меняет выборку — возвращаемся на первую страницу
    useEffect(() => {
        setPage(0);
    }, [debouncedSearch, templateId, setPage]);

    const params = useMemo<BanlistViolationStatsQueryParams>(() => {
        const result: BanlistViolationStatsQueryParams = {
            offset: page * pageSize,
            count: pageSize,
        };
        const trimmed = debouncedSearch.trim();
        if (trimmed) result.query = trimmed;
        return result;
    }, [page, pageSize, debouncedSearch]);

    const { stats, total, isLoading, errorMessage, reload } = useBanlistTemplateStats(
        banlistId,
        templateId,
        params
    );

    // страница уехала за пределы выборки (например, сбросили последнюю строку) — подвинуть назад
    useClampPage({
        page,
        setPage,
        total,
        pageSize,
        currentCount: stats.length,
        isLoading,
    });

    if (templates.length === 0) {
        return <Message info>{t("banlistStatsNoTemplates")}</Message>;
    }

    const templateOptions = templates.map((template) => ({
        key: template.id,
        value: template.id,
        text: template.name || `#${template.id}`,
    }));

    const runStatAction = async (item: BanlistViolationStatsOutWeb, action: StatAction) => {
        if (templateId === null || item.id === undefined) return;

        setBusy({ id: item.id, action });

        const subject = toSubjectIn(item.subject);
        const result = await runWithToast(
            () =>
                action === "violation"
                    ? banlistApi.incrementViolation(banlistId, templateId, { subject })
                    : banlistApi.incrementCompletedGames(banlistId, templateId, { subject }),
            {
                error: t(
                    action === "violation"
                        ? "banlistStatsIncrementFailedToast"
                        : "banlistStatsCompletedGameFailedToast"
                ),
            }
        );

        if (result.ok) {
            await reload();
            // нарушение могло создать/обновить запись бана — освежаем список и счётчик.
            // завершённая игра только копит топливо (остывание ленивое), записи не трогает.
            if (action === "violation") await onReload?.();
        }

        setBusy(null);
    };

    const openEdit = (item: BanlistViolationStatsOutWeb) => {
        setEditing(item);
        setEditViolations(String(item.violationCount ?? 0));
        setEditLastGraduated(String(item.lastGraduatedCount ?? 0));
        setEditGames(String(item.completedGamesCount ?? 0));
    };

    const saveEdit = async () => {
        if (editing === null || templateId === null || editing.id === undefined) return;

        const data: BanlistViolationStatsPatchInWeb = {
            violationCount: toCount(editViolations),
            lastGraduatedCount: toCount(editLastGraduated),
            completedGamesCount: toCount(editGames),
        };

        setSavingEdit(true);

        const result = await runWithToast(
            () => banlistApi.patchTemplateStats(banlistId, templateId, editing.id as number, data),
            { success: t("banlistStatsEditedToast"), error: t("banlistStatsEditFailedToast") }
        );

        if (result.ok) {
            setEditing(null);
            await reload();
        }

        setSavingEdit(false);
    };

    const handleReset = (item: BanlistViolationStatsOutWeb) => {
        if (templateId === null || item.id === undefined) return;
        const itemId = item.id;

        void resetAction.run(
            itemId,
            () => banlistApi.deleteTemplateStats(banlistId, templateId, itemId),
            {
                confirm: t("banlistStatsResetConfirm", { subject: subjectString(item.subject) }),
                success: t("banlistStatsResetToast"),
                error: t("banlistStatsResetFailedToast"),
                onSuccess: reload,
            }
        );
    };

    return (
        <div>
            <Segment>
                <Header as="h4">{t("banlistStatsHeader")}</Header>
                <div className="stats-controls">
                    <Dropdown
                        onChange={(_, data) => setTemplateId(data.value as number)}
                        options={templateOptions}
                        selection
                        value={templateId ?? undefined}
                    />
                    <Input
                        icon="search"
                        iconPosition="left"
                        onChange={(_, data) => setSearch(data.value)}
                        placeholder={t("banlistStatsSearchPlaceholder")}
                        value={search}
                    />
                </div>
            </Segment>

            {errorMessage && <Message error>{errorMessage}</Message>}

            {isLoading ? (
                <Segment>
                    <Loader active inline="centered" />
                </Segment>
            ) : stats.length === 0 ? (
                <Message info>
                    {debouncedSearch.trim() ? t("banlistStatsNoMatch") : t("banlistStatsEmpty")}
                </Message>
            ) : (
                <>
                    <Table basic="very" compact>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>{t("banlistSubjectHeader")}</Table.HeaderCell>
                                <Table.HeaderCell textAlign="right">
                                    {t("banlistStatsHeaderViolations")}
                                </Table.HeaderCell>
                                <Table.HeaderCell textAlign="right">
                                    {t("banlistStatsHeaderGames")}
                                </Table.HeaderCell>
                                <Table.HeaderCell>{t("banlistStatsHeaderLast")}</Table.HeaderCell>
                                <Table.HeaderCell>{t("banlistStatsHeaderReset")}</Table.HeaderCell>
                                <Table.HeaderCell textAlign="right">{t("actions")}</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {stats.map((item) => {
                                const violations = item.violationCount ?? 0;
                                const games = item.completedGamesCount ?? 0;
                                const rowBusy = busy?.id === item.id || resetAction.busyId === item.id;
                                return (
                                    <Table.Row key={item.id}>
                                        <Table.Cell>
                                            <code>{subjectString(item.subject)}</code>
                                        </Table.Cell>
                                        <Table.Cell textAlign="right">
                                            <Label circular>{violations}</Label>
                                        </Table.Cell>
                                        <Table.Cell textAlign="right">{games}</Table.Cell>
                                        <Table.Cell>
                                            {formatBanlistDate(item.lastTriggeredAt)}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {item.graduationResetAt
                                                ? formatBanlistDate(item.graduationResetAt)
                                                : "—"}
                                        </Table.Cell>
                                        <Table.Cell textAlign="right" collapsing>
                                            <Button.Group size="mini">
                                                {canTrackViolations && (
                                                    <>
                                                        <Button
                                                            basic
                                                            disabled={rowBusy}
                                                            icon="gamepad"
                                                            loading={
                                                                busy?.id === item.id &&
                                                                busy?.action === "completedGame"
                                                            }
                                                            onClick={() =>
                                                                void runStatAction(
                                                                    item,
                                                                    "completedGame"
                                                                )
                                                            }
                                                            title={t("banlistStatsCompletedGame")}
                                                        />
                                                        <Button
                                                            basic
                                                            disabled={rowBusy}
                                                            icon="plus"
                                                            loading={
                                                                busy?.id === item.id &&
                                                                busy?.action === "violation"
                                                            }
                                                            onClick={() =>
                                                                void runStatAction(item, "violation")
                                                            }
                                                            title={t("banlistStatsIncrement")}
                                                        />
                                                    </>
                                                )}
                                                {canInsert && (
                                                    <>
                                                        <Button
                                                            basic
                                                            disabled={rowBusy}
                                                            icon="edit"
                                                            onClick={() => openEdit(item)}
                                                            title={t("banlistStatsEdit")}
                                                        />
                                                        <Button
                                                            basic
                                                            disabled={rowBusy}
                                                            icon="trash"
                                                            loading={resetAction.busyId === item.id}
                                                            negative
                                                            onClick={() => void handleReset(item)}
                                                            title={t("banlistStatsReset")}
                                                        />
                                                    </>
                                                )}
                                            </Button.Group>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>

                    <BanlistPaginationFooter
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        page={page}
                        pageSize={pageSize}
                        shownCount={stats.length}
                        total={total}
                    />
                </>
            )}

            <Modal onClose={() => setEditing(null)} open={editing !== null} size="mini">
                <Modal.Header>{t("banlistStatsEditHeader")}</Modal.Header>
                <Modal.Content>
                    {editing && (
                        <p>
                            <code>{subjectString(editing.subject)}</code>
                        </p>
                    )}
                    <Form>
                        <Form.Input
                            label={t("banlistStatsHeaderViolations")}
                            min={0}
                            onChange={(_, data) => setEditViolations(data.value)}
                            type="number"
                            value={editViolations}
                        />
                        <Form.Input
                            label={t("banlistStatsEditLastGraduated")}
                            min={0}
                            onChange={(_, data) => setEditLastGraduated(data.value)}
                            type="number"
                            value={editLastGraduated}
                        />
                        <Form.Input
                            label={t("banlistStatsHeaderGames")}
                            min={0}
                            onChange={(_, data) => setEditGames(data.value)}
                            type="number"
                            value={editGames}
                        />
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setEditing(null)}>{t("cancel")}</Button>
                    <Button loading={savingEdit} onClick={() => void saveEdit()} primary>
                        {t("save")}
                    </Button>
                </Modal.Actions>
            </Modal>

            {resetAction.confirmModal}
        </div>
    );
}

export default BanlistStatsTab;
