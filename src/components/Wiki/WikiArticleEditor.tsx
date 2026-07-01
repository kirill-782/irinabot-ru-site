import React, { useContext, useEffect, useRef, useState } from "react";
import {
    Button,
    Checkbox,
    Dropdown,
    Form,
    Input,
    Message,
    Modal,
    Segment,
} from "semantic-ui-react";
import Markdown from "../Markdown";
import WikiFilesModal from "./WikiFilesModal";
import WikiArticleLinkModal from "./WikiArticleLinkModal";
import { AppRuntimeSettingsContext } from "../../context";
import { ArticleDto, SavePayloadRequest } from "../../models/rest/Wiki";
import { WikiService } from "../../services/WikiService";
import { SUPPORT_LOCALES } from "../../config/Locales";
import { LanguageRepositoryKeys } from "../../localization/Lang";

interface WikiArticleEditorProps {
    api: WikiService;
    wiki: string;
    article: ArticleDto;
    locale: string;
    // текущие флаги статьи (приходят из узла дерева; ArticleDto их не содержит)
    initialHidden?: boolean;
    initialLocked?: boolean;
    // удаление файлов доступно только техадмину (WIKI_TECH_ADMIN), см. useWikiAccess
    canDeleteFiles?: boolean;
    onSaved: (article: ArticleDto, locale: string) => void;
    onCancel: () => void;
}

const localeOptions = SUPPORT_LOCALES.map((l) => ({ key: l, value: l, text: l }));

// Кнопки быстрой вставки Markdown-разметки.
interface MdSnippet {
    id: string;
    // ключи локализации (резолвятся через t() при рендере)
    labelKey: LanguageRepositoryKeys;
    placeholderKey?: LanguageRepositoryKeys;
    // нелокализуемый плейсхолдер (например, "code")
    placeholder?: string;
    icon?: string;
    before: string;
    after?: string;
}

const SNIPPETS: MdSnippet[] = [
    { id: "h1", labelKey: "wikiEditorSnippetH1", before: "# ", placeholderKey: "wikiEditorSnippetHeadingPlaceholder" },
    { id: "h2", labelKey: "wikiEditorSnippetH2", before: "## ", placeholderKey: "wikiEditorSnippetHeadingPlaceholder" },
    { id: "bold", labelKey: "wikiEditorSnippetBold", icon: "bold", before: "**", after: "**", placeholderKey: "wikiEditorSnippetTextPlaceholder" },
    { id: "italic", labelKey: "wikiEditorSnippetItalic", icon: "italic", before: "_", after: "_", placeholderKey: "wikiEditorSnippetTextPlaceholder" },
    { id: "link", labelKey: "wikiEditorSnippetLink", icon: "linkify", before: "[", after: "](https://)", placeholderKey: "wikiEditorSnippetTextPlaceholder" },
    { id: "code", labelKey: "wikiEditorSnippetCode", icon: "code", before: "`", after: "`", placeholder: "code" },
    { id: "list", labelKey: "wikiEditorSnippetList", icon: "list ul", before: "- ", placeholderKey: "wikiEditorSnippetListItemPlaceholder" },
    {
        id: "info",
        labelKey: "wikiEditorSnippetInfo",
        icon: "info",
        before: ":::div{.ui.info.message}\n",
        after: "\n:::",
        placeholderKey: "wikiEditorSnippetTextPlaceholder",
    },
];
const byId = (id: string) => SNIPPETS.find((s) => s.id === id) as MdSnippet;

// Ключ локальной копии черновика в браузере.
const draftKey = (wiki: string, articleId: number, loc: string) =>
    `wikiDraft:${wiki}:${articleId}:${loc}`;

interface Draft {
    title: string;
    payload: string;
    ts: number;
}

function WikiArticleEditor({
    api,
    wiki,
    article,
    locale,
    initialHidden,
    initialLocked,
    canDeleteFiles,
    onSaved,
    onCancel,
}: WikiArticleEditorProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [editLocale, setEditLocale] = useState(locale);
    const [title, setTitle] = useState(article.title ?? "");
    const [payload, setPayload] = useState(article.payload ?? "");
    const [hidden, setHidden] = useState(!!initialHidden);
    const [locked, setLocked] = useState(!!initialLocked);
    const [saving, setSaving] = useState(false);
    const [loadingLocale, setLoadingLocale] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [filesOpen, setFilesOpen] = useState(false);
    const [articleLinkOpen, setArticleLinkOpen] = useState(false);
    // найденная несохранённая копия (предложение восстановить)
    const [pendingDraft, setPendingDraft] = useState<Draft | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // эталон сохранённого состояния — для отслеживания несохранённых изменений
    const baselineRef = useRef({ title: "", payload: "", hidden: false, locked: false });

    // проверка наличия локальной копии для (статья, локаль)
    const checkDraft = (t: string, p: string, loc: string) => {
        try {
            const raw = localStorage.getItem(draftKey(wiki, article.id, loc));
            const d: Draft | null = raw ? JSON.parse(raw) : null;
            setPendingDraft(d && (d.title !== t || d.payload !== p) ? d : null);
        } catch {
            setPendingDraft(null);
        }
    };

    // Сброс полей при переключении на другую статью.
    useEffect(() => {
        const t = article.title ?? "";
        const p = article.payload ?? "";
        setEditLocale(locale);
        setTitle(t);
        setPayload(p);
        setHidden(!!initialHidden);
        setLocked(!!initialLocked);
        setError(null);
        baselineRef.current = { title: t, payload: p, hidden: !!initialHidden, locked: !!initialLocked };
        checkDraft(t, p, locale);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [article, locale, initialHidden, initialLocked]);

    const contentDirty = () =>
        title !== baselineRef.current.title || payload !== baselineRef.current.payload;
    const isDirty = () =>
        contentDirty() ||
        hidden !== baselineRef.current.hidden ||
        locked !== baselineRef.current.locked;

    // Автосохранение черновика в localStorage (с задержкой), пока есть изменения контента.
    useEffect(() => {
        if (loadingLocale) return;
        if (title === baselineRef.current.title && payload === baselineRef.current.payload) return;
        const key = draftKey(wiki, article.id, editLocale);
        const t = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify({ title, payload, ts: Date.now() }));
            } catch {
                /* квота/недоступно — игнорируем */
            }
        }, 600);
        return () => clearTimeout(t);
    }, [title, payload, editLocale, wiki, article.id, loadingLocale]);

    // Предупреждение браузера о несохранённых изменениях при закрытии/перезагрузке.
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!isDirty()) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, payload, hidden, locked]);

    // Загрузка контента другой локали (для перевода статьи).
    const switchLocale = async (next: string) => {
        if (next === editLocale) return;
        if (
            contentDirty() &&
            !window.confirm(t("wikiEditorSwitchLocaleConfirm"))
        ) {
            return;
        }

        setEditLocale(next);
        setError(null);
        setLoadingLocale(true);
        let nextTitle = "";
        let nextPayload = "";
        try {
            const dto = await api.getArticleById(article.id, next);
            nextTitle = dto.title ?? "";
            nextPayload = dto.payload ?? "";
        } catch {
            // Перевода для этой локали ещё нет — начинаем с пустого.
        }
        setTitle(nextTitle);
        setPayload(nextPayload);
        // hidden/locked — свойства статьи, не зависят от локали; их эталон не трогаем
        baselineRef.current = { ...baselineRef.current, title: nextTitle, payload: nextPayload };
        checkDraft(nextTitle, nextPayload, next);
        setLoadingLocale(false);
    };

    const restoreDraft = () => {
        if (!pendingDraft) return;
        setTitle(pendingDraft.title);
        setPayload(pendingDraft.payload);
        setPendingDraft(null);
    };

    const discardDraft = () => {
        try {
            localStorage.removeItem(draftKey(wiki, article.id, editLocale));
        } catch {
            /* игнорируем */
        }
        setPendingDraft(null);
    };

    // Вставка через document.execCommand — попадает в нативную историю (Ctrl+Z).
    // Для парных маркеров (жирный/курсив/код/…) работает как тоггл: если выделение
    // уже обёрнуто — снимаем разметку, иначе оборачиваем.
    const insert = (snippet: MdSnippet) => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const value = el.value;
        const before = snippet.before;
        const after = snippet.after ?? "";
        const sel = value.slice(start, end);

        if (after) {
            // выделение включает сами маркеры: **текст** → текст
            if (
                sel.length >= before.length + after.length &&
                sel.startsWith(before) &&
                sel.endsWith(after)
            ) {
                const inner = sel.slice(before.length, sel.length - after.length);
                document.execCommand("insertText", false, inner);
                el.setSelectionRange(start, start + inner.length);
                return;
            }
            // маркеры снаружи выделения: **[текст]** → текст (повторное нажатие)
            if (
                start >= before.length &&
                value.slice(start - before.length, start) === before &&
                value.slice(end, end + after.length) === after
            ) {
                el.setSelectionRange(start - before.length, end + after.length);
                document.execCommand("insertText", false, sel);
                el.setSelectionRange(start - before.length, start - before.length + sel.length);
                return;
            }
        }

        // обычная обёртка/вставка
        const placeholder = snippet.placeholderKey ? t(snippet.placeholderKey) : snippet.placeholder;
        const selected = sel || placeholder || "";
        document.execCommand("insertText", false, before + selected + after);
        const selStart = start + before.length;
        el.setSelectionRange(selStart, selStart + selected.length);
    };

    const insertText = (text: string) => {
        const el = textareaRef.current;
        if (!el) {
            setPayload((p) => p + text);
            return;
        }
        el.focus();
        document.execCommand("insertText", false, text);
    };

    // Загрузка файла в вики и вставка: картинкой (![@]) или ссылкой ([@]).
    const uploadFile = async (file: File, asImage: boolean) => {
        setUploading(true);
        setError(null);
        try {
            const dto = await api.uploadWikiFile(wiki, file, article.id);
            insertText(asImage ? `![@](file(${dto.id}))` : `[@](file(${dto.id}))`);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || t("wikiEditorUploadError"));
        }
        setUploading(false);
    };

    const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file, true);
        e.target.value = "";
    };

    const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file, file.type.startsWith("image/"));
        e.target.value = "";
    };

    const onDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
        const file = Array.from(e.dataTransfer.files)[0];
        if (file) {
            e.preventDefault();
            uploadFile(file, file.type.startsWith("image/"));
        }
    };

    const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
        const file = item?.getAsFile();
        if (file) {
            e.preventDefault();
            uploadFile(file, true);
        }
    };

    const save = async () => {
        setSaving(true);
        setError(null);

        const body: SavePayloadRequest = { locale: editLocale, title, payload };

        try {
            const updated = await api.saveArticlePayload(article.id, body);
            // скрытая/заблокированная — свойства статьи, отдельной ручкой
            await api.updateArticle(article.id, { hidden, locked });
            baselineRef.current = { title, payload, hidden, locked };
            try {
                localStorage.removeItem(draftKey(wiki, article.id, editLocale));
            } catch {
                /* игнорируем */
            }
            onSaved(updated, editLocale);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || t("wikiEditorSaveError"));
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (isDirty() && !window.confirm(t("wikiEditorCancelConfirm"))) {
            return;
        }
        onCancel();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        const k = e.key.toLowerCase();
        if (k === "s") {
            e.preventDefault();
            if (!saving) save();
        } else if (k === "b") {
            e.preventDefault();
            insert(byId("bold"));
        } else if (k === "i") {
            e.preventDefault();
            insert(byId("italic"));
        } else if (k === "k") {
            e.preventDefault();
            insert(byId("link"));
        }
    };

    return (
        <Form error={!!error}>
            <div
                style={{
                    display: "flex",
                    gap: "0.5em",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: "0.6em",
                }}
            >
                <Dropdown
                    selection
                    compact
                    options={localeOptions}
                    value={editLocale}
                    disabled={saving || loadingLocale}
                    loading={loadingLocale}
                    title={t("wikiEditorLocaleTitle")}
                    onChange={(_, data) => switchLocale(String(data.value))}
                />
                <span style={{ flex: 1 }} />
                <Button
                    basic
                    type="button"
                    icon="eye"
                    content={t("wikiEditorPreview")}
                    onClick={() => setPreviewOpen(true)}
                />
                <Button
                    primary
                    type="button"
                    loading={saving}
                    disabled={saving}
                    icon="save"
                    content={t("wikiEditorSave")}
                    title={t("wikiEditorSaveTitle")}
                    onClick={save}
                />
                <Button basic type="button" disabled={saving} content={t("wikiEditorCancel")} onClick={handleCancel} />
            </div>

            <Input
                fluid
                placeholder={t("wikiEditorTitlePlaceholder")}
                value={title}
                disabled={loadingLocale}
                onChange={(_, data) => setTitle(data.value)}
                style={{ marginBottom: "0.5em" }}
            />

            <div style={{ display: "flex", gap: "0.5em", flexWrap: "wrap", marginBottom: "0.5em" }}>
                <Button.Group basic size="tiny" style={{ flexWrap: "wrap" }}>
                    {SNIPPETS.map((s) => (
                        <Button
                            key={s.id}
                            type="button"
                            icon={s.icon}
                            content={s.icon ? undefined : t(s.labelKey)}
                            title={t(s.labelKey)}
                            onClick={() => insert(s)}
                        />
                    ))}
                </Button.Group>

                <Button
                    basic
                    size="tiny"
                    type="button"
                    icon="image"
                    content={t("wikiEditorImage")}
                    title={t("wikiEditorImageTitle")}
                    loading={uploading}
                    disabled={uploading || loadingLocale}
                    onClick={() => imageInputRef.current?.click()}
                />
                <Button
                    basic
                    size="tiny"
                    type="button"
                    icon="upload"
                    content={t("wikiEditorFile")}
                    title={t("wikiEditorFileTitle")}
                    loading={uploading}
                    disabled={uploading || loadingLocale}
                    onClick={() => fileInputRef.current?.click()}
                />
                <Button
                    basic
                    size="tiny"
                    type="button"
                    icon="linkify"
                    content={t("wikiEditorArticleLink")}
                    title={t("wikiEditorArticleLinkTitle")}
                    disabled={loadingLocale}
                    onClick={() => setArticleLinkOpen(true)}
                />

                <span style={{ flex: 1 }} />

                <Button
                    basic
                    size="tiny"
                    type="button"
                    icon="folder open"
                    content={t("wikiEditorFiles")}
                    title={t("wikiEditorFilesTitle")}
                    onClick={() => setFilesOpen(true)}
                />

                <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={onPickImage} />
                <input ref={fileInputRef} type="file" hidden onChange={onPickFile} />
            </div>

            {pendingDraft && (
                <Message
                    warning
                    onDismiss={() => setPendingDraft(null)}
                    style={{ marginBottom: "0.5em" }}
                >
                    <Message.Content>
                        {t("wikiEditorDraftFound")}{" "}
                        <Button size="mini" primary onClick={restoreDraft}>
                            {t("wikiEditorDraftRestore")}
                        </Button>
                        <Button size="mini" basic onClick={discardDraft}>
                            {t("wikiEditorDraftDiscard")}
                        </Button>
                    </Message.Content>
                </Message>
            )}

            {error && <Message error content={error} />}

            <textarea
                ref={textareaRef}
                value={payload}
                disabled={loadingLocale}
                onChange={(e) => setPayload(e.target.value)}
                onKeyDown={onKeyDown}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onPaste={onPaste}
                spellCheck={false}
                placeholder={t("wikiEditorPayloadPlaceholder")}
                style={{
                    width: "100%",
                    minHeight: "60vh",
                    resize: "vertical",
                    fontFamily: "monospace",
                    fontSize: "0.95em",
                    padding: "0.8em",
                    boxSizing: "border-box",
                }}
            />

            <Form.Group inline style={{ marginTop: "0.6em" }}>
                <Checkbox
                    label={t("wikiEditorHidden")}
                    checked={hidden}
                    onChange={(_, data) => setHidden(!!data.checked)}
                    style={{ marginRight: "1.5em" }}
                />
                <Checkbox
                    label={t("wikiEditorLocked")}
                    checked={locked}
                    onChange={(_, data) => setLocked(!!data.checked)}
                />
            </Form.Group>

            <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} closeIcon size="large">
                <Modal.Header>
                    {title ? t("wikiEditorPreviewWithTitle", { title }) : t("wikiEditorPreview")}
                </Modal.Header>
                <Modal.Content scrolling>
                    <Segment basic>
                        <Markdown>{payload}</Markdown>
                    </Segment>
                </Modal.Content>
            </Modal>

            <WikiFilesModal
                open={filesOpen}
                api={api}
                wiki={wiki}
                articleId={article.id}
                canDelete={canDeleteFiles}
                onClose={() => setFilesOpen(false)}
                onInsert={insertText}
            />

            <WikiArticleLinkModal
                open={articleLinkOpen}
                api={api}
                wiki={wiki}
                locale={editLocale}
                onClose={() => setArticleLinkOpen(false)}
                onInsert={insertText}
            />
        </Form>
    );
}

export default WikiArticleEditor;
