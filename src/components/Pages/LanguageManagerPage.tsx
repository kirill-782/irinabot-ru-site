import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Container, Header, Icon, Input, Label, Loader, Message, Select, Table } from "semantic-ui-react";
import { toast } from "@kokomi/react-semantic-toasts";
import { SUPPORT_LOCALES } from "../../config/Locales";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { WikiLangMap } from "../../models/rest/Wiki";
import { useWikiAccess } from "../../utils/useWikiAccess";

const languageOptions = SUPPORT_LOCALES.map((i) => ({ key: i, value: i, text: i }));

// Новый (ещё не сохранённый) ключ словаря. id — только для React-ключа строки.
interface NewRow {
    id: number;
    key: string;
    value: string;
}

interface LangRowProps {
    langKey: string;
    value: string;
    changed: boolean;
    disabled: boolean;
    onChange: (key: string, value: string) => void;
    onReset: (key: string) => void;
}

// Строка существующего ключа. memo, чтобы ввод в одно поле не перерисовывал весь список.
const LangRow = React.memo(function LangRow({
    langKey,
    value,
    changed,
    disabled,
    onChange,
    onReset,
}: LangRowProps) {
    return (
        <Table.Row warning={changed}>
            <Table.Cell verticalAlign="top">
                <code>{langKey}</code>
                {changed && (
                    <Label size="tiny" color="yellow" horizontal style={{ marginTop: "0.3em" }}>
                        изменено
                    </Label>
                )}
            </Table.Cell>
            <Table.Cell>
                <Input
                    fluid
                    value={value}
                    disabled={disabled}
                    onChange={(_, data) => onChange(langKey, data.value)}
                />
            </Table.Cell>
            <Table.Cell collapsing textAlign="center" verticalAlign="top">
                <Button
                    icon="undo"
                    basic
                    size="tiny"
                    title="Вернуть исходное значение"
                    disabled={disabled || !changed}
                    onClick={() => onReset(langKey)}
                />
            </Table.Cell>
        </Table.Row>
    );
});

function LanguageManagerPage() {
    const { wikiApi } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);
    const { isLangAdmin } = useWikiAccess();

    const [activeLocale, setActiveLocale] = useState(language.currentLocale);

    // original — снимок с сервера; values — текущие правки существующих ключей.
    const [original, setOriginal] = useState<WikiLangMap>({});
    const [values, setValues] = useState<WikiLangMap>({});
    const [newRows, setNewRows] = useState<NewRow[]>([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("");

    const newRowId = useRef(0);

    const load = useCallback(
        async (locale: string, signal?: AbortSignal) => {
            setLoading(true);
            setError(null);
            try {
                const data = await wikiApi.getLang(locale, { signal });
                setOriginal(data);
                setValues(data);
                setNewRows([]);
            } catch (e: any) {
                if (signal?.aborted) return;
                setError(
                    e?.response?.data?.message || e?.message || "Не удалось загрузить языковой пакет"
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
        load(activeLocale, controller.signal);
        return () => controller.abort();
    }, [activeLocale, load, isLangAdmin]);

    // Изменённые существующие ключи и заполненные новые строки — то, что уйдёт в PATCH.
    const changedKeys = useMemo(
        () => Object.keys(values).filter((k) => values[k] !== original[k]),
        [values, original]
    );

    const filledNewRows = useMemo(() => newRows.filter((r) => r.key.trim().length > 0), [newRows]);

    const dirtyCount = changedKeys.length + filledNewRows.length;

    const visibleKeys = useMemo(() => {
        const keys = Object.keys(values).sort((a, b) => a.localeCompare(b));
        const f = filter.trim().toLowerCase();
        if (!f) return keys;
        return keys.filter(
            (k) => k.toLowerCase().includes(f) || (values[k] ?? "").toLowerCase().includes(f)
        );
    }, [values, filter]);

    const setValue = useCallback(
        (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value })),
        []
    );

    const resetKey = useCallback(
        (key: string) => setValues((prev) => ({ ...prev, [key]: original[key] })),
        [original]
    );

    const addRow = () => {
        newRowId.current += 1;
        setNewRows((prev) => [...prev, { id: newRowId.current, key: "", value: "" }]);
    };

    const setNewRowField = (id: number, field: "key" | "value", value: string) =>
        setNewRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

    const removeRow = (id: number) => setNewRows((prev) => prev.filter((r) => r.id !== id));

    const switchLocale = (locale: string) => {
        if (locale === activeLocale) return;
        if (
            dirtyCount > 0 &&
            !window.confirm("Есть несохранённые изменения. Переключить язык и потерять их?")
        ) {
            return;
        }
        setActiveLocale(locale);
    };

    const reload = () => {
        if (
            dirtyCount > 0 &&
            !window.confirm("Есть несохранённые изменения. Перезагрузить и потерять их?")
        ) {
            return;
        }
        load(activeLocale);
    };

    const discard = () => {
        setValues(original);
        setNewRows([]);
        setFilter("");
    };

    const save = async () => {
        const patch: WikiLangMap = {};
        changedKeys.forEach((k) => (patch[k] = values[k]));
        filledNewRows.forEach((r) => (patch[r.key.trim()] = r.value));

        const count = Object.keys(patch).length;
        if (count === 0) return;

        setSaving(true);
        try {
            await wikiApi.patchLang(activeLocale, patch);
            // Сохранённые ключи становятся новым «исходным» состоянием.
            setOriginal((prev) => ({ ...prev, ...patch }));
            setValues((prev) => ({ ...prev, ...patch }));
            setNewRows([]);
            toast({
                title: "Языковой пакет сохранён",
                description: `Обновлено ключей: ${count}`,
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

    const totalKeys = Object.keys(values).length;
    const busy = loading || saving;

    if (!isLangAdmin) {
        return (
            <Container style={{ padding: "1em 0" }}>
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
            </Container>
        );
    }

    return (
        <Container style={{ padding: "1em 0 4em" }}>
            <Header>
                Редактор языкового пакета
                <Header.Subheader>
                    Словарь i18n (<code>/v1/lang</code>). Изменяются только заполненные ключи —
                    остальные остаются как есть. Требуется роль <b>WIKI_LANG_ADMIN</b>.
                </Header.Subheader>
            </Header>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "flex-end",
                    gap: "0.75em",
                    marginBottom: "1em",
                }}
            >
                <div>
                    <div style={{ marginBottom: "0.25em", fontWeight: "bold" }}>
                        Редактируемый языковой пакет
                    </div>
                    <Select
                        options={languageOptions}
                        value={activeLocale}
                        disabled={busy}
                        onChange={(_, data) => switchLocale(data.value.toString())}
                    />
                </div>
                <div style={{ flex: "1 1 240px", minWidth: 220 }}>
                    <div style={{ marginBottom: "0.25em", fontWeight: "bold" }}>Поиск</div>
                    <Input
                        fluid
                        icon="search"
                        placeholder="Фильтр по ключу или значению…"
                        value={filter}
                        disabled={loading}
                        onChange={(_, data) => setFilter(data.value)}
                    />
                </div>
                <Button
                    basic
                    icon="refresh"
                    content="Обновить"
                    disabled={busy}
                    onClick={reload}
                />
            </div>

            {error && <Message error content={error} />}

            {loading ? (
                <Loader active inline="centered" content="Загрузка словаря…" />
            ) : (
                <>
                    <div style={{ marginBottom: "0.5em", color: "rgba(0,0,0,0.5)" }}>
                        Показано {visibleKeys.length} из {totalKeys} ключей
                        {dirtyCount > 0 && (
                            <Label color="yellow" size="tiny" horizontal style={{ marginLeft: "0.5em" }}>
                                несохранённых изменений: {dirtyCount}
                            </Label>
                        )}
                    </div>

                    <Table compact celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell width={5}>Ключ</Table.HeaderCell>
                                <Table.HeaderCell width={10}>Значение</Table.HeaderCell>
                                <Table.HeaderCell width={1} textAlign="center">
                                    <Icon name="undo" title="Сброс" />
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {visibleKeys.length === 0 && (
                                <Table.Row>
                                    <Table.Cell colSpan={3} disabled textAlign="center">
                                        {totalKeys === 0
                                            ? "Словарь пуст"
                                            : "Ничего не найдено по фильтру"}
                                    </Table.Cell>
                                </Table.Row>
                            )}
                            {visibleKeys.map((key) => (
                                <LangRow
                                    key={key}
                                    langKey={key}
                                    value={values[key] ?? ""}
                                    changed={values[key] !== original[key]}
                                    disabled={saving}
                                    onChange={setValue}
                                    onReset={resetKey}
                                />
                            ))}
                        </Table.Body>
                    </Table>

                    <Header as="h4">
                        Новые ключи
                        <Header.Subheader>
                            Если ключ совпадёт с существующим — его значение будет перезаписано.
                        </Header.Subheader>
                    </Header>

                    {newRows.length > 0 && (
                        <Table compact celled>
                            <Table.Body>
                                {newRows.map((row) => {
                                    const trimmed = row.key.trim();
                                    const collides = trimmed.length > 0 && trimmed in original;
                                    return (
                                        <Table.Row key={row.id}>
                                            <Table.Cell width={5} verticalAlign="top">
                                                <Input
                                                    fluid
                                                    placeholder="ключ"
                                                    value={row.key}
                                                    disabled={saving}
                                                    error={collides}
                                                    onChange={(_, data) =>
                                                        setNewRowField(row.id, "key", data.value)
                                                    }
                                                />
                                                {collides && (
                                                    <Label
                                                        basic
                                                        color="orange"
                                                        size="tiny"
                                                        pointing
                                                    >
                                                        ключ уже существует — будет перезаписан
                                                    </Label>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell width={10}>
                                                <Input
                                                    fluid
                                                    placeholder="значение"
                                                    value={row.value}
                                                    disabled={saving}
                                                    onChange={(_, data) =>
                                                        setNewRowField(row.id, "value", data.value)
                                                    }
                                                />
                                            </Table.Cell>
                                            <Table.Cell width={1} collapsing textAlign="center" verticalAlign="top">
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
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table>
                    )}

                    <Button basic icon="plus" content="Добавить ключ" disabled={saving} onClick={addRow} />
                </>
            )}

            {/* Панель сохранения — закреплена снизу, видна при прокрутке длинного словаря. */}
            <div
                style={{
                    position: "sticky",
                    bottom: 0,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.5em",
                    padding: "0.75em 0",
                    marginTop: "1em",
                    background: "rgba(255,255,255,0.92)",
                    borderTop: "1px solid rgba(0,0,0,0.1)",
                }}
            >
                <Button
                    icon="cancel"
                    content="Отменить изменения"
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
        </Container>
    );
}

export default LanguageManagerPage;
