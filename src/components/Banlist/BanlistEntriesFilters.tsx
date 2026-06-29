import React, { useContext, useMemo } from "react";
import { Dropdown, Input } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import {
    BanlistEntriesActionFilter,
    BanlistEntriesStatusFilter,
    TEMPLATE_FILTER_NONE,
    UseBanlistEntriesFilterResult,
} from "../../hooks/useBanlistEntriesFilter";
import { BanlistViolationTemplateOutWeb } from "../../models/rest/Banlist";
import { actionLongLabel, BANLIST_ACTIONS } from "../../utils/BanlistUtils";

interface BanlistEntriesFiltersProps {
    templates: BanlistViolationTemplateOutWeb[];
    // теги шаблонов банлиста (GET /templates/tags) — источник дропдауна «Тег»
    templateTags: string[];
    filter: UseBanlistEntriesFilterResult;
}

function BanlistEntriesFilters({ templates, templateTags, filter }: BanlistEntriesFiltersProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const actionFilterOptions = useMemo(
        () => [
            { key: "all", value: "all", text: t("banlistEntriesFilterActionAll") },
            ...BANLIST_ACTIONS.map((action) => ({
                key: action,
                value: action,
                text: actionLongLabel(t, action),
            })),
        ],
        [t]
    );

    const statusFilterOptions = useMemo(
        () => [
            { key: "all", value: "all", text: t("banlistEntriesFilterStatusAll") },
            { key: "active", value: "active", text: t("banlistEntriesFilterStatusActive") },
            { key: "expired", value: "expired", text: t("banlistEntriesFilterStatusExpired") },
            { key: "deferred", value: "deferred", text: t("banlistEntriesFilterStatusDeferred") },
        ],
        [t]
    );

    const tagOptions = useMemo(
        () => [
            { key: "all", value: "all", text: t("banlistEntriesFilterTagAll") },
            ...templateTags.map((tag) => ({ key: tag, value: tag, text: `#${tag}` })),
        ],
        [templateTags, t]
    );

    const templateOptions = useMemo(() => {
        return [
            { key: "all", value: "all", text: t("banlistEntriesFilterTemplateAll") },
            { key: "none", value: TEMPLATE_FILTER_NONE, text: t("banlistEntriesFilterTemplateNone") },
            ...templates.map((template) => ({
                key: template.id || 0,
                value: template.id || 0,
                text: template.name || `#${template.id}`,
            })),
        ];
    }, [templates, t]);

    return (
        <div className="filters">
            <Input
                icon="search"
                iconPosition="left"
                onChange={(_, data) => filter.setSearch(data.value)}
                placeholder={t("banlistEntriesSearchPlaceholder")}
                value={filter.search}
            />
            <Dropdown
                button
                onChange={(_, data) =>
                    filter.setActionFilter(data.value as BanlistEntriesActionFilter)
                }
                options={actionFilterOptions}
                value={filter.actionFilter}
            />
            <Dropdown
                button
                onChange={(_, data) =>
                    filter.setStatusFilter(data.value as BanlistEntriesStatusFilter)
                }
                options={statusFilterOptions}
                value={filter.statusFilter}
            />
            <Dropdown
                button
                onChange={(_, data) => filter.setTemplateFilter(data.value as number | "all")}
                options={templateOptions}
                value={filter.templateFilter}
            />
            {tagOptions.length > 1 && (
                <Dropdown
                    button
                    className="mini"
                    onChange={(_, data) => filter.setTagFilter(String(data.value))}
                    options={tagOptions}
                    value={filter.tagFilter}
                />
            )}
        </div>
    );
}

export default BanlistEntriesFilters;
