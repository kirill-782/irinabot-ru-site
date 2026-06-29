import { LanguageRepositoryKeys } from "../localization/Lang";

// Ключи колонок таблицы записей бана, которые можно скрывать.
// Служебные колонки (переключатель статуса и кнопки действий) всегда видимы
// и в этот список не входят.
export type BanlistEntryColumnKey =
    | "id"
    | "subject"
    | "action"
    | "reason"
    | "tag"
    | "template"
    | "activation"
    | "expire"
    | "issuer";

export interface BanlistEntryColumnDef {
    key: BanlistEntryColumnKey;
    // ключ локализации для заголовка колонки и подписи в модалке выбора
    labelKey: LanguageRepositoryKeys;
}

// Порядок совпадает с порядком колонок в таблице — используется и для отрисовки
// заголовков, и для списка чекбоксов в модалке выбора колонок.
export const BANLIST_ENTRY_COLUMNS: BanlistEntryColumnDef[] = [
    { key: "id", labelKey: "banlistEntriesHeaderNumber" },
    { key: "subject", labelKey: "banlistSubjectHeader" },
    { key: "action", labelKey: "banlistActionHeader" },
    { key: "reason", labelKey: "banlistReasonHeader" },
    { key: "tag", labelKey: "banlistTagHeader" },
    { key: "template", labelKey: "banlistEntriesHeaderTemplate" },
    { key: "activation", labelKey: "banlistEntriesHeaderActivation" },
    { key: "expire", labelKey: "banlistExpireHeader" },
    { key: "issuer", labelKey: "banlistEntriesHeaderIssuer" },
];

export const BANLIST_ENTRY_COLUMN_KEYS: BanlistEntryColumnKey[] =
    BANLIST_ENTRY_COLUMNS.map((column) => column.key);
