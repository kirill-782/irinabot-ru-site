import React, { useCallback, useEffect, useState } from "react";
import { Button, Dropdown, Loader, Message, Modal } from "semantic-ui-react";
import { ArticleNodeDto } from "../../models/rest/Wiki";
import { WikiService } from "../../services/WikiService";

interface WikiMovePageModalProps {
    open: boolean;
    api: WikiService;
    wiki: string;
    locale: string;
    node: ArticleNodeDto | null;
    onClose: () => void;
    onMoved: () => void;
}

interface FlatNode {
    node: ArticleNodeDto;
    depth: number;
}

const ROOT = "__root__";

function WikiMovePageModal({ open, api, wiki, locale, node, onClose, onMoved }: WikiMovePageModalProps) {
    const [flat, setFlat] = useState<FlatNode[]>([]);
    const [target, setTarget] = useState<string>(ROOT);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Полный обход дерева вики (корни + рекурсивно дети).
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const roots = await api.getWikiArticles(wiki, locale);
            const acc: FlatNode[] = [];
            const walk = async (nodes: ArticleNodeDto[], depth: number) => {
                for (const n of nodes) {
                    acc.push({ node: n, depth });
                    if (n.hasChild) {
                        await walk(await api.getArticleChildren(n.id, locale), depth + 1);
                    }
                }
            };
            await walk(roots, 0);
            setFlat(acc);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Не удалось загрузить дерево страниц");
        }
        setLoading(false);
    }, [api, wiki, locale]);

    useEffect(() => {
        if (open && node) {
            setTarget(ROOT);
            load();
        }
    }, [open, node, load]);

    // Кандидаты в родители: все страницы, кроме самой переносимой и её потомков
    // (иначе образуется цикл). Плюс вариант «Корень».
    const options = (() => {
        const opts = [{ key: ROOT, value: ROOT, text: "— Корень —" }];
        if (!node) return opts;

        const parentOf = new Map<number, number | null>();
        flat.forEach(({ node: n }) => parentOf.set(n.id, n.parentId));

        const isSelfOrDescendant = (id: number) => {
            let cur: number | null | undefined = id;
            const seen = new Set<number>();
            while (cur != null && !seen.has(cur)) {
                if (cur === node.id) return true;
                seen.add(cur);
                cur = parentOf.get(cur);
            }
            return false;
        };

        flat.forEach(({ node: n, depth }) => {
            if (isSelfOrDescendant(n.id)) return;
            opts.push({
                key: String(n.id),
                value: String(n.id),
                text: `${"— ".repeat(depth)}${n.title || n.url}`,
            });
        });

        return opts;
    })();

    const move = async () => {
        if (!node) return;

        const parentId = target === ROOT ? undefined : Number(target);

        // уже на месте — просто закрываем
        const alreadyThere =
            (target === ROOT && node.parentId == null) || parentId === node.parentId;
        if (alreadyThere) {
            onClose();
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await api.moveArticle(node.id, parentId);
            onMoved();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Не удалось переместить страницу");
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} size="tiny" closeIcon>
            <Modal.Header>Переместить «{node?.title || node?.url}»</Modal.Header>
            <Modal.Content>
                {error && <Message error content={error} />}
                {loading ? (
                    <Loader active inline="centered" />
                ) : (
                    <>
                        <p>Новый родитель:</p>
                        <Dropdown
                            selection
                            search
                            fluid
                            options={options}
                            value={target}
                            disabled={saving}
                            onChange={(_, data) => setTarget(String(data.value))}
                        />
                    </>
                )}
            </Modal.Content>
            <Modal.Actions>
                <Button basic content="Отмена" onClick={onClose} disabled={saving} />
                <Button
                    primary
                    icon="exchange"
                    content="Переместить"
                    onClick={move}
                    loading={saving}
                    disabled={saving || loading}
                />
            </Modal.Actions>
        </Modal>
    );
}

export default WikiMovePageModal;
