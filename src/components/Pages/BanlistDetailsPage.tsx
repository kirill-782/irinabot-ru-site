import React, { useContext, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Button,
    Container,
    Header,
    Label,
    Loader,
    Menu,
    Message,
    Segment,
} from "semantic-ui-react";
import { AppRuntimeSettingsContext, AuthContext, RestContext } from "../../context";
import { useBanlist } from "../../hooks/useBanlist";
import { useBanlistEntries } from "../../hooks/useBanlistEntries";
import { useBanlistEntriesFilter } from "../../hooks/useBanlistEntriesFilter";
import { useBanlistTemplates } from "../../hooks/useBanlistTemplates";
import { useBanlistTemplateTags } from "../../hooks/useBanlistTemplateTags";
import { useConfirmModal } from "../../hooks/useConfirmModal";
import { useQueryState } from "../../hooks/useQueryState";
import { useResolveConnectorIds } from "../../hooks/useResolveConnectorIds";
import { useTitle } from "../../hooks/useTitle";
import { formatRelative } from "../../utils/BanlistUtils";
import {
    banlistAccessLevelLabel,
    resolveBanlistCapabilities,
} from "../../utils/BanlistPermissions";
import { runWithToast } from "../../utils/ToastUtils";
import UserIdLabel from "../AdminList/UserIdLabel";
import BanlistCheckTab from "../Banlist/BanlistCheckTab";
import BanlistEntriesTab from "../Banlist/BanlistEntriesTab";
import BanlistEntryDetailsModal from "../Banlist/BanlistEntryDetailsModal";
import BanlistFormModal from "../Banlist/BanlistFormModal";
import BanlistStatsTab from "../Banlist/BanlistStatsTab";
import BanlistTemplatesTab from "../Banlist/BanlistTemplatesTab";
import MetaRobots from "../Meta/MetaRobots";
import Breadcrumbs from "../Breadcrumbs";

import "./BanlistDetailsPage.scss";

type TabKey = "entries" | "templates" | "check" | "stats";

const TAB_KEYS: TabKey[] = ["entries", "templates", "check", "stats"];

const isTabKey = (value?: string | null): value is TabKey =>
    !!value && (TAB_KEYS as string[]).includes(value);

function BanlistDetailsPage() {
    const navigate = useNavigate();
    const params = useParams();
    const banlistId = Number(params.id);
    const { banlistApi } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);
    const { auth } = useContext(AuthContext);
    const t = language.getString;

    const {
        data: banlist,
        isLoading: isBanlistLoading,
        errorMessage: banlistError,
        reload: reloadBanlist,
    } = useBanlist(banlistId);

    // Производные права текущего пользователя в этом банлисте (ролевая модель админ-листа).
    const capabilities = useMemo(
        () => resolveBanlistCapabilities(banlist, auth.currentAuth),
        [banlist, auth.currentAuth]
    );

    const entriesFilter = useBanlistEntriesFilter();

    const {
        entries,
        total: entriesTotal,
        isLoading: isEntriesLoading,
        errorMessage: entriesError,
        reload: reloadEntries,
    } = useBanlistEntries(banlistId, entriesFilter.params);

    const {
        templates,
        isLoading: isTemplatesLoading,
        errorMessage: templatesError,
        reload: reloadTemplates,
    } = useBanlistTemplates(banlistId);

    const { tags: templateTags } = useBanlistTemplateTags(banlistId);

    const [tabQuery, setTabQuery] = useQueryState("tab");
    const activeTab: TabKey = isTabKey(tabQuery) ? tabQuery : "entries";

    const setActiveTab = (key: TabKey) => {
        setTabQuery(key === "entries" ? undefined : key);
    };

    // подробный просмотр записи через адресную строку: /banlist/{id}?entry={entryId}
    const [entryQuery, setEntryQuery] = useQueryState("entry");
    const detailsEntryId =
        entryQuery !== undefined && /^\d+$/.test(entryQuery) ? Number(entryQuery) : null;

    useResolveConnectorIds(useMemo(() => [banlist?.ownerUserId], [banlist?.ownerUserId]));

    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [isDeleting, setDeleting] = useState(false);

    const { confirm, confirmModal } = useConfirmModal();

    useTitle(
        banlist?.name
            ? t("banlistDetailsTitle", { name: banlist.name })
            : t("banlistDetailsTitleFallback")
    );

    const tabs = useMemo(
        () => [
            { key: "entries" as TabKey, label: t("banlistTabEntries"), count: entriesTotal },
            { key: "templates" as TabKey, label: t("banlistTabTemplates"), count: templates.length },
            { key: "check" as TabKey, label: t("banlistTabCheck") },
            { key: "stats" as TabKey, label: t("banlistTabStats") },
        ],
        [entriesTotal, templates.length, t]
    );

    const handleDelete = async () => {
        if (!(await confirm(t("banlistDeleteConfirm", { name: banlist?.name })))) return;

        setDeleting(true);

        const result = await runWithToast(() => banlistApi.deleteBanlist(banlistId), {
            success: t("banlistDeletedToast"),
            error: t("banlistDeleteFailedToast"),
        });

        // при успехе уходим со страницы — флаг не сбрасываем, компонент размонтируется
        if (result.ok) {
            navigate("/banlist");
        } else {
            setDeleting(false);
        }
    };

    // Подтверждение — отдельный диалог. Чтобы не открывать модалку поверх модалки,
    // настройки закрываем до вопроса.
    const deleteFromSettings = () => {
        setSettingsOpen(false);
        void handleDelete();
    };

    if (!Number.isFinite(banlistId)) {
        return (
            <Container className="banlist-details extra">
                <Message error>{t("banlistDetailsInvalidId")}</Message>
            </Container>
        );
    }

    return (
        <Container className="banlist-details extra">
            <MetaRobots noIndex />

            <Breadcrumbs
                items={[
                    { label: t("banlistOverviewHeader"), to: "/banlist" },
                    { label: banlist?.name || undefined },
                ]}
            />

            {banlistError && (
                <Message error>
                    <Message.Header>{t("banlistDetailsLoadFailed")}</Message.Header>
                    <p>{banlistError}</p>
                </Message>
            )}

            {isBanlistLoading && !banlist ? (
                <Segment>
                    <Loader active inline="centered" />
                </Segment>
            ) : (
                banlist && (
                    <>
                        <div className="page-header">
                            <Header as="h1">
                                {banlist.name || t("banlistCardFallbackName", { id: banlist.id })}
                                <Header.Subheader>
                                    {banlist.description && <span>{banlist.description} · </span>}
                                    {t("banlistUpdatedAt", {
                                        value: formatRelative(
                                            t,
                                            banlist.updatedAt || banlist.createdAt
                                        ),
                                    })}
                                    {banlist.ownerUserId && (
                                        <span>
                                            {" "}
                                            · {t("banlistOwnerLabel")}{" "}
                                            <UserIdLabel userId={banlist.ownerUserId} />
                                        </span>
                                    )}
                                    <span>
                                        {" "}
                                        ·{" "}
                                        <Label size="tiny">
                                            {capabilities.canManageBanlist
                                                ? t("banlistAccessOwner")
                                                : banlistAccessLevelLabel(t, capabilities)}
                                        </Label>
                                    </span>
                                </Header.Subheader>
                            </Header>
                            {capabilities.canManageBanlist && (
                                <div className="actions">
                                    <Button
                                        basic
                                        onClick={() => setSettingsOpen(true)}
                                        size="small"
                                    >
                                        {t("banlistSettings")}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Menu pointing secondary>
                            {tabs.map((tab) => (
                                <Menu.Item
                                    active={activeTab === tab.key}
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <Label circular size="mini">
                                            {tab.count}
                                        </Label>
                                    )}
                                </Menu.Item>
                            ))}
                        </Menu>

                        {activeTab === "entries" && (
                            <BanlistEntriesTab
                                banlistApi={banlistApi}
                                banlistId={banlistId}
                                canInsert={capabilities.canInsert}
                                canTrackViolations={capabilities.canTrackViolations}
                                entries={entries}
                                errorMessage={entriesError}
                                filter={entriesFilter}
                                isLoading={isEntriesLoading}
                                onOpenEntryDetails={(id) => setEntryQuery(String(id))}
                                onReload={reloadEntries}
                                restrictEntryTags={!!banlist.restrictEntryTagsToTemplates}
                                templates={templates}
                                templateTags={templateTags}
                                total={entriesTotal}
                            />
                        )}

                        {activeTab === "templates" && (
                            <BanlistTemplatesTab
                                banlistApi={banlistApi}
                                banlistId={banlistId}
                                canManage={capabilities.canManageTemplates}
                                errorMessage={templatesError}
                                isLoading={isTemplatesLoading}
                                onReload={reloadTemplates}
                                templates={templates}
                            />
                        )}

                        {activeTab === "check" && <BanlistCheckTab banlistId={banlistId} />}

                        {activeTab === "stats" && (
                            <BanlistStatsTab
                                banlistApi={banlistApi}
                                banlistId={banlistId}
                                canInsert={capabilities.canInsert}
                                canTrackViolations={capabilities.canTrackViolations}
                                onReload={reloadEntries}
                                templates={templates}
                            />
                        )}

                        <BanlistFormModal
                            banlist={banlist}
                            canDelete={capabilities.canManageBanlist}
                            isDeleting={isDeleting}
                            onClose={() => setSettingsOpen(false)}
                            onDelete={deleteFromSettings}
                            onSuccess={() => reloadBanlist()}
                            open={isSettingsOpen}
                        />

                        <BanlistEntryDetailsModal
                            banlistApi={banlistApi}
                            banlistId={banlistId}
                            entryId={detailsEntryId}
                            onClose={() => setEntryQuery(undefined)}
                            open={detailsEntryId !== null}
                            templates={templates}
                        />
                    </>
                )
            )}

            {confirmModal}
        </Container>
    );
}

export default BanlistDetailsPage;
