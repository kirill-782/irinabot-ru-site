import React, { useCallback, useContext, useEffect, useState } from "react";
import { Icon, List, Loader, Message, Modal } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { ArticleNodeDto } from "../../models/rest/Wiki";
import { WikiService } from "../../services/WikiService";

// Выбор статьи текущей вики для вставки указателя-ссылки:
//   [@](article(<wiki>/<articleUrl>))
// По аналогии с WikiFilesModal (вставка файлов). Дерево статей разворачивается
// в плоский список с отступами по уровню вложенности.

interface WikiArticleLinkModalProps {
    open: boolean;
    api: WikiService;
    wiki: string;
    locale: string;
    onClose: () => void;
    onInsert: (markdown: string) => void;
}

interface FlatNode {
    node: ArticleNodeDto;
    depth: number;
}

function WikiArticleLinkModal({ open, api, wiki, locale, onClose, onInsert }: WikiArticleLinkModalProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;
    const [items, setItems] = useState<FlatNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const flat: FlatNode[] = [];
            const walk = async (nodes: ArticleNodeDto[], depth: number) => {
                for (const node of nodes) {
                    flat.push({ node, depth });
                    if (node.hasChild) {
                        await walk(await api.getArticleChildren(node.id, locale), depth + 1);
                    }
                }
            };
            await walk(await api.getWikiArticles(wiki, locale), 0);
            setItems(flat);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || t("wikiArticleLinkLoadError"));
        }
        setLoading(false);
    }, [api, wiki, locale]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (open) load();
    }, [open, load]);

    const insert = (node: ArticleNodeDto) => {
        onInsert(`[@](article(${wiki}/${node.url}))`);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} size="small" closeIcon>
            <Modal.Header>{t("wikiArticleLinkTitle")}</Modal.Header>
            <Modal.Content scrolling>
                {error && <Message error content={error} />}

                {loading ? (
                    <Loader active inline="centered" />
                ) : items.length === 0 ? (
                    <Message info content={t("wikiArticleLinkEmpty")} />
                ) : (
                    <List divided relaxed selection>
                        {items.map(({ node, depth }) => (
                            <List.Item
                                key={node.id}
                                onClick={() => insert(node)}
                                style={{ paddingLeft: `${depth * 1.5}em`, cursor: "pointer" }}
                            >
                                <Icon name="file alternate outline" />
                                <List.Content>
                                    <List.Header>{node.title || node.url}</List.Header>
                                    <List.Description>{node.url}</List.Description>
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                )}
            </Modal.Content>
        </Modal>
    );
}

export default WikiArticleLinkModal;
