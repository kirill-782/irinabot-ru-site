import React, { useContext, useEffect, useState } from "react";
import { Button, Checkbox, Form, Message, Modal } from "semantic-ui-react";
import { ArticleNodeDto, CreateArticleRequest } from "../../models/rest/Wiki";
import { WikiService } from "../../services/WikiService";
import { AppRuntimeSettingsContext } from "../../context";

interface WikiCreatePageModalProps {
    open: boolean;
    api: WikiService;
    wiki: string;
    locale: string;
    parent: ArticleNodeDto | null;
    onClose: () => void;
    onCreated: (node: ArticleNodeDto) => void;
}

// slug: латиница/цифры/дефис; пробелы → дефис.
const toSlug = (value: string) =>
    value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");

function WikiCreatePageModal({
    open,
    api,
    wiki,
    locale,
    parent,
    onClose,
    onCreated,
}: WikiCreatePageModalProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [urlTouched, setUrlTouched] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [locked, setLocked] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Сброс формы при каждом открытии.
    useEffect(() => {
        if (open) {
            setTitle("");
            setUrl("");
            setUrlTouched(false);
            setHidden(false);
            setLocked(false);
            setSaving(false);
            setError(null);
        }
    }, [open]);

    // Пока url не правили вручную — генерируем его из заголовка.
    const onTitleChange = (value: string) => {
        setTitle(value);
        if (!urlTouched) setUrl(toSlug(value));
    };

    const create = async () => {
        const slug = toSlug(url);
        if (!slug) {
            setError(t("wikiCreateInvalidUrl"));
            return;
        }

        setSaving(true);
        setError(null);

        const body: CreateArticleRequest = {
            url: slug,
            parentId: parent?.id,
            hidden,
            locked,
        };

        try {
            let node = await api.createArticle(wiki, body);
            // Гарантируем флаги статьи отдельной ручкой (на случай, если create их не учёл).
            if (hidden || locked) {
                node = await api.updateArticle(node.id, { hidden, locked });
            }
            // Сразу заводим контент для текущей локали, чтобы у страницы были
            // заголовок и тело (иначе она будет без payload).
            await api.saveArticlePayload(node.id, {
                locale,
                title: title || slug,
                payload: "",
            });
            onCreated({ ...node, title: title || node.title || slug });
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || t("wikiCreateError"));
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} size="tiny" closeIcon>
            <Modal.Header>{t("wikiCreateHeader")}</Modal.Header>
            <Modal.Content>
                <Message info size="small" style={{ marginTop: 0 }}>
                    {parent ? (
                        <>
                            {t("wikiCreateChildOf")} <b>{parent.title || parent.url}</b>
                        </>
                    ) : (
                        t("wikiCreateRootPage")
                    )}
                </Message>
                <Form error={!!error}>
                    <Form.Input
                        label={t("wikiCreateTitleLabel")}
                        placeholder={t("wikiCreateTitlePlaceholder")}
                        value={title}
                        onChange={(_, data) => onTitleChange(data.value)}
                        autoFocus
                    />
                    <Form.Input
                        label={t("wikiCreateUrlLabel")}
                        placeholder="how-to-play"
                        value={url}
                        onChange={(_, data) => {
                            setUrlTouched(true);
                            setUrl(data.value);
                        }}
                    />
                    <Form.Group inline>
                        <Checkbox
                            label={t("wikiCreateHidden")}
                            checked={hidden}
                            onChange={(_, data) => setHidden(!!data.checked)}
                            style={{ marginRight: "1.5em" }}
                        />
                        <Checkbox
                            label={t("wikiCreateLocked")}
                            checked={locked}
                            onChange={(_, data) => setLocked(!!data.checked)}
                        />
                    </Form.Group>
                    {error && <Message error content={error} />}
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button basic content={t("wikiCreateCancel")} onClick={onClose} disabled={saving} />
                <Button
                    primary
                    icon="plus"
                    content={t("wikiCreateCreate")}
                    onClick={create}
                    loading={saving}
                    disabled={saving || !url}
                />
            </Modal.Actions>
        </Modal>
    );
}

export default WikiCreatePageModal;
