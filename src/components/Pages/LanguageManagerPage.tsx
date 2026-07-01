import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Checkbox, Header, Input, Label, Loader, Message, Table } from "semantic-ui-react";
import { toast } from "@kokomi/react-semantic-toasts";
import { SUPPORT_LOCALES } from "../../config/Locales";
import { RestContext } from "../../context";
import { WikiLangMap } from "../../models/rest/Wiki";
import { LanguageData } from "../../localization/Lang";
import { useWikiAccess } from "../../utils/useWikiAccess";

const LOCALES = SUPPORT_LOCALES;

// Ширины колонок (px). Широкие столбцы значений → при нескольких языках таблица не влезает
// в контейнер и появляется горизонтальный скролл (с закреплённой первой колонкой).
const KEY_COL = 240;
const DEFAULT_COL = 320;
const LOCALE_COL = 460;
const TABLE_MIN_WIDTH = KEY_COL + DEFAULT_COL + LOCALES.length * LOCALE_COL;

// Дефолты сайта (русские), вшитые в бандл из Lang.ts. Это полный набор ключей, которые
// сайт реально использует — даже если на сервере (/v1/lang) для них ещё нет перевода.
const DEFAULTS = LanguageData as Record<string, string>;

type Pack = WikiLangMap;
type Packs = Record<string, Pack>; // locale -> { key: value }

const emptyPacks = (): Packs => Object.fromEntries(LOCALES.map((l) => [l, {}]));

// Новая (ещё не сохранённая) строка-ключ: имя + значения по локалям.
interface NewRow {
    id: number;
    key: string;
    values: Record<string, string>;
}

// Залипания в прокручиваемом контейнере таблицы. Позиционирование — здесь, непрозрачный
// фон под тему — в semantic-ui-sass ({dark,light}/globals/site.overrides.scss):
// класс .lang-sticky-cell для тела первой колонки; шапка непрозрачна штатно (th темы).
const stickyBodyLeft: React.CSSProperties = {
    position: "sticky",
    left: 0,
    zIndex: 1,
};
const stickyHeadTop: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 2,
};
// Угол «Ключ» — липнет и сверху, и слева; поверх остальных.
const stickyCorner: React.CSSProperties = {
    position: "sticky",
    top: 0,
    left: 0,
    zIndex: 3,
};

interface LangRowProps {
    langKey: string;
    def: string; // дефолт из кода (Lang.ts)
    disabled: boolean;
    localeValues: string[]; // в порядке LOCALES
    localeDirty: boolean[];
    onChange: (locale: string, key: string, value: string) => void;
}

// Строка ключа. memo с поэлементным сравнением — правка одной ячейки не перерисовывает
// весь список (а он может быть в сотни строк × число языков).
const LangRow = React.memo(
    function LangRow({ langKey, def, disabled, localeValues, onChange }: LangRowProps) {
        return (
            <Table.Row>
                <Table.Cell
                    className="lang-sticky-cell"
                    style={{ ...stickyBodyLeft, minWidth: KEY_COL, verticalAlign: "top" }}
                >
                    <code>{langKey}</code>
                </Table.Cell>
                <Table.Cell className="lang-muted" style={{ minWidth: DEFAULT_COL, verticalAlign: "top" }}>
                    {def}
                </Table.Cell>
                {LOCALES.map((locale, i) => {
                    const value = localeValues[i];
                    const missing = !value;
                    return (
                        <Table.Cell key={locale} error={missing} style={{ minWidth: LOCALE_COL, verticalAlign: "top" }}>
                            <Input
                                fluid
                                value={value}
                                placeholder={def || "нет перевода"}
                                disabled={disabled}
                                onChange={(_, data) => onChange(locale, langKey, data.value)}
                            />
                        </Table.Cell>
                    );
                })}
            </Table.Row>
        );
    },
    (a, b) =>
        a.langKey === b.langKey &&
        a.def === b.def &&
        a.disabled === b.disabled &&
        a.onChange === b.onChange &&
        a.localeValues.length === b.localeValues.length &&
        a.localeValues.every((v, i) => v === b.localeValues[i]) &&
        a.localeDirty.every((v, i) => v === b.localeDirty[i])
);

function LanguageManagerPage() {
    const { wikiApi } = useContext(RestContext);
    const { isLangAdmin } = useWikiAccess();

    // original — снимок с сервера по каждой локали; edits — только пользовательские правки.
    const [original, setOriginal] = useState<Packs>(emptyPacks);
    const [edits, setEdits] = useState<Packs>(emptyPacks);
    const [newRows, setNewRows] = useState<NewRow[]>([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("");
    const [onlyMissing, setOnlyMissing] = useState(false);

    const newRowId = useRef(0);

    const load = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setError(null);
            try {
                const packs = await Promise.all(
                    LOCALES.map((locale) =>
                        wikiApi
                            .getLang(locale, { signal })
                            .catch(() => ({} as Pack)) // нет пакета для локали — пустой
                    )
                );
                if (signal?.aborted) return;
                const next: Packs = {};
                LOCALES.forEach((locale, i) => (next[locale] = packs[i]));
                setOriginal(next);
                setEdits(emptyPacks());
                setNewRows([]);
            } catch (e: any) {
                if (signal?.aborted) return;
                setError(
                    e?.response?.data?.message || e?.message || "Не удалось загрузить языковые пакеты"
                );
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [wikiApi]
    );

    useEffect(() => {
        if (!isLangAdmin) return;
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load, isLangAdmin]);

    // Эффективное значение (правка поверх снимка) и флаг «изменено» для (локаль, ключ).
    const effective = useCallback(
        (locale: string, key: string) => {
            const e = edits[locale];
            if (e && Object.prototype.hasOwnProperty.call(e, key)) return e[key];
            return original[locale]?.[key] ?? "";
        },
        [edits, original]
    );

    const isDirty = useCallback(
        (locale: string, key: string) => {
            const e = edits[locale];
            if (!e || !Object.prototype.hasOwnProperty.call(e, key)) return false;
            return e[key] !== (original[locale]?.[key] ?? "");
        },
        [edits, original]
    );

    // Полный набор ключей: дефолты из кода ∪ всё, что пришло с сервера по всем локалям.
    const allKeys = useMemo(() => {
        const set = new Set<string>(Object.keys(DEFAULTS));
        LOCALES.forEach((locale) => Object.keys(original[locale] || {}).forEach((k) => set.add(k)));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [original]);

    const visibleKeys = useMemo(() => {
        const f = filter.trim().toLowerCase();
        return allKeys.filter((key) => {
            if (onlyMissing && !LOCALES.some((l) => !effective(l, key))) return false;
            if (!f) return true;
            if (key.toLowerCase().includes(f)) return true;
            if ((DEFAULTS[key] || "").toLowerCase().includes(f)) return true;
            return LOCALES.some((l) => effective(l, key).toLowerCase().includes(f));
        });
    }, [allKeys, filter, onlyMissing, effective]);

    const onChangeCell = useCallback((locale: string, key: string, value: string) => {
        setEdits((prev) => ({ ...prev, [locale]: { ...prev[locale], [key]: value } }));
    }, []);

    const setNewRowKey = (id: number, key: string) =>
        setNewRows((prev) => prev.map((r) => (r.id === id ? { ...r, key } : r)));

    const setNewRowValue = (id: number, locale: string, value: string) =>
        setNewRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, values: { ...r.values, [locale]: value } } : r))
        );

    const addRow = () => {
        newRowId.current += 1;
        setNewRows((prev) => [...prev, { id: newRowId.current, key: "", values: {} }]);
    };

    const removeRow = (id: number) => setNewRows((prev) => prev.filter((r) => r.id !== id));

    // Кол-во несохранённых изменений (изменённые ячейки + заполненные новые строки).
    const dirtyCount = useMemo(() => {
        let n = 0;
        LOCALES.forEach((locale) => {
            const e = edits[locale] || {};
            Object.keys(e).forEach((k) => {
                if (e[k] !== (original[locale]?.[k] ?? "")) n += 1;
            });
        });
        newRows.forEach((r) => {
            if (!r.key.trim()) return;
            LOCALES.forEach((l) => {
                if ((r.values[l] || "").length > 0) n += 1;
            });
        });
        return n;
    }, [edits, original, newRows]);

    const discard = () => {
        setEdits(emptyPacks());
        setNewRows([]);
    };

    const reload = () => {
        if (
            dirtyCount > 0 &&
            !window.confirm("Есть несохранённые изменения. Перезагрузить и потерять их?")
        ) {
            return;
        }
        load();
    };

    const save = async () => {
        // Собираем патч по каждой локали: изменённые ячейки + заполненные новые ключи.
        const patches: Packs = {};
        LOCALES.forEach((locale) => {
            const patch: Pack = {};
            const e = edits[locale] || {};
            Object.keys(e).forEach((k) => {
                if (e[k] !== (original[locale]?.[k] ?? "")) patch[k] = e[k];
            });
            newRows.forEach((r) => {
                const key = r.key.trim();
                const val = r.values[locale] || "";
                if (key && val) patch[key] = val;
            });
            patches[locale] = patch;
        });

        const total = LOCALES.reduce((sum, l) => sum + Object.keys(patches[l]).length, 0);
        if (total === 0) return;

        setSaving(true);
        try {
            await Promise.all(
                LOCALES.filter((l) => Object.keys(patches[l]).length > 0).map((l) =>
                    wikiApi.patchLang(l, patches[l])
                )
            );
            setOriginal((prev) => {
                const next: Packs = {};
                LOCALES.forEach((l) => (next[l] = { ...(prev[l] || {}), ...patches[l] }));
                return next;
            });
            setEdits(emptyPacks());
            setNewRows([]);
            toast({
                title: "Языковые пакеты сохранены",
                description: `Обновлено значений: ${total}`,
                type: "success",
            });
        } catch (e: any) {
            toast({
                title: "Ошибка сохранения",
                description:
                    e?.response?.data?.message || e?.message || "Не удалось сохранить изменения",
                type: "error",
                time: 10000,
            });
        } finally {
            setSaving(false);
        }
    };

    if (!isLangAdmin) {
        return (
            <div>
                <Header>
                    Редактор языкового пакета
                    <Header.Subheader>
                        Словарь i18n (<code>/v1/lang</code>).
                    </Header.Subheader>
                </Header>
                <Message
                    error
                    icon="lock"
                    header="Недостаточно прав"
                    content="Для редактирования словаря локализаций нужна роль WIKI_LANG_ADMIN."
                />
            </div>
        );
    }

    const busy = loading || saving;

    return (
        <div className="language-manager" style={{ paddingBottom: "5em" }}>
            <Header>
                Редактор языкового пакета
                <Header.Subheader>
                    Словарь локализаций (<code>/v1/lang</code>) по всем языкам сразу. Пустая (красная)
                    ячейка — ключ ещё не переведён для этого языка; столбец «По умолчанию» — значение
                    из кода (<code>Lang.ts</code>). Сохраняются только изменённые ячейки.
                </Header.Subheader>
            </Header>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "0.75em",
                    margin: "1em 0",
                }}
            >
                <Input
                    icon="search"
                    placeholder="Поиск по ключу или значению…"
                    value={filter}
                    disabled={loading}
                    onChange={(_, data) => setFilter(data.value)}
                    style={{ flex: "1 1 260px", minWidth: 220 }}
                />
                <Checkbox
                    toggle
                    label="Только без перевода"
                    checked={onlyMissing}
                    disabled={loading}
                    onChange={(_, data) => setOnlyMissing(!!data.checked)}
                />
                <Button basic icon="refresh" content="Обновить" disabled={busy} onClick={reload} />

                <div style={{ flex: 1 }} />

                <Button
                    icon="cancel"
                    content="Отменить"
                    disabled={busy || dirtyCount === 0}
                    onClick={discard}
                />
                <Button
                    primary
                    icon="save"
                    content={dirtyCount > 0 ? `Сохранить (${dirtyCount})` : "Сохранить"}
                    loading={saving}
                    disabled={busy || dirtyCount === 0}
                    onClick={save}
                />
            </div>

            {error && <Message error content={error} />}

            {loading ? (
                <Loader active inline="centered" content="Загрузка словаря…" />
            ) : (
                <>
                    <div className="lang-muted" style={{ marginBottom: "0.5em" }}>
                        Показано {visibleKeys.length} из {allKeys.length} ключей · языков:{" "}
                        {LOCALES.length}
                        {dirtyCount > 0 && (
                            <Label
                                color="yellow"
                                size="tiny"
                                horizontal
                                style={{ marginLeft: "0.5em" }}
                            >
                                несохранённых изменений: {dirtyCount}
                            </Label>
                        )}
                    </div>

                    <div style={{ maxHeight: "65vh", overflow: "auto" }}>
                        <Table celled compact structured style={{ minWidth: TABLE_MIN_WIDTH }}>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell
                                        className="lang-sticky-cell"
                                        style={{ ...stickyCorner, minWidth: KEY_COL }}
                                    >
                                        Ключ
                                    </Table.HeaderCell>
                                    <Table.HeaderCell style={{ ...stickyHeadTop, minWidth: DEFAULT_COL }}>
                                        По умолчанию (код)
                                    </Table.HeaderCell>
                                    {LOCALES.map((locale) => (
                                        <Table.HeaderCell key={locale} style={{ ...stickyHeadTop, minWidth: LOCALE_COL }}>
                                            {locale}
                                        </Table.HeaderCell>
                                    ))}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {visibleKeys.length === 0 && (
                                    <Table.Row>
                                        <Table.Cell colSpan={2 + LOCALES.length} disabled textAlign="center">
                                            {allKeys.length === 0
                                                ? "Словарь пуст"
                                                : "Ничего не найдено"}
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                                {visibleKeys.map((key) => (
                                    <LangRow
                                        key={key}
                                        langKey={key}
                                        def={DEFAULTS[key] || ""}
                                        disabled={saving}
                                        localeValues={LOCALES.map((l) => effective(l, key))}
                                        localeDirty={LOCALES.map((l) => isDirty(l, key))}
                                        onChange={onChangeCell}
                                    />
                                ))}
                            </Table.Body>
                        </Table>
                    </div>

                    <Header as="h4">Новые ключи</Header>
                    {newRows.length > 0 && (
                        <div style={{ overflowX: "auto" }}>
                            <Table celled compact structured style={{ minWidth: TABLE_MIN_WIDTH }}>
                                <Table.Body>
                                    {newRows.map((row) => {
                                        const trimmed = row.key.trim();
                                        const collides = !!trimmed && (trimmed in DEFAULTS);
                                        return (
                                            <Table.Row key={row.id}>
                                                <Table.Cell
                                                    className="lang-sticky-cell"
                                                    style={{ ...stickyBodyLeft, minWidth: KEY_COL, verticalAlign: "top" }}
                                                >
                                                    <Input
                                                        fluid
                                                        placeholder="ключ"
                                                        value={row.key}
                                                        disabled={saving}
                                                        error={collides}
                                                        onChange={(_, data) => setNewRowKey(row.id, data.value)}
                                                    />
                                                    {collides && (
                                                        <Label basic color="orange" size="tiny" pointing>
                                                            ключ уже существует
                                                        </Label>
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell style={{ minWidth: DEFAULT_COL, verticalAlign: "top" }}>
                                                    <Button
                                                        icon="trash"
                                                        basic
                                                        color="red"
                                                        size="tiny"
                                                        title="Удалить строку"
                                                        disabled={saving}
                                                        onClick={() => removeRow(row.id)}
                                                    />
                                                </Table.Cell>
                                                {LOCALES.map((locale) => (
                                                    <Table.Cell key={locale} style={{ minWidth: LOCALE_COL, verticalAlign: "top" }}>
                                                        <Input
                                                            fluid
                                                            placeholder={locale}
                                                            value={row.values[locale] || ""}
                                                            disabled={saving}
                                                            onChange={(_, data) =>
                                                                setNewRowValue(row.id, locale, data.value)
                                                            }
                                                        />
                                                    </Table.Cell>
                                                ))}
                                            </Table.Row>
                                        );
                                    })}
                                </Table.Body>
                            </Table>
                        </div>
                    )}
                    <Button basic icon="plus" content="Добавить ключ" disabled={saving} onClick={addRow} />
                </>
            )}
        </div>
    );
}

export default LanguageManagerPage;
