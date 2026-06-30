import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import { Button, Icon, Loader } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { ArticleNodeDto } from "../../models/rest/Wiki";
import { WikiService } from "../../services/WikiService";
import "./WikiSidebar.scss";

export interface WikiSidebarHandle {
    // Перечитать дерево, сохранив раскрытые узлы (после создания/сохранения страницы).
    refresh: () => void;
    // Найти загруженный узел по url (для текущих флагов hidden/locked).
    getNode: (url: string) => ArticleNodeDto | undefined;
}

interface WikiSidebarProps {
    api: WikiService;
    wiki: string;
    locale: string;
    currentUrl?: string;
    // Право на правку: показывает действия дерева (порядок/перенос/добавление). См. useWikiAccess.
    canEdit?: boolean;
    onAddChild: (parent: ArticleNodeDto | null) => void;
    onMove: (node: ArticleNodeDto) => void;
}

const INDENT = 16;

// порядок соседей задаётся полем position
const byPosition = (arr: ArticleNodeDto[]) =>
    [...arr].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

const WikiSidebar = forwardRef<WikiSidebarHandle, WikiSidebarProps>(
    ({ api, wiki, locale, currentUrl, canEdit, onAddChild, onMove }, ref) => {
        const [roots, setRoots] = useState<ArticleNodeDto[]>([]);
        const [childrenMap, setChildrenMap] = useState<Record<number, ArticleNodeDto[]>>({});
        const [expanded, setExpanded] = useState<Set<number>>(new Set());
        const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
        const [loadingRoots, setLoadingRoots] = useState(false);

        const loadRoots = useCallback(async () => {
            setLoadingRoots(true);
            try {
                setRoots(byPosition(await api.getWikiArticles(wiki, locale)));
            } catch {
                /* игнорируем — отрисуем пустое дерево */
            }
            setLoadingRoots(false);
        }, [api, wiki, locale]);

        // Сброс и первичная загрузка при смене вики/локали.
        useEffect(() => {
            setChildrenMap({});
            setExpanded(new Set());
            loadRoots();
        }, [loadRoots]);

        const loadChildren = useCallback(
            async (id: number) => {
                setLoadingIds((s) => new Set(s).add(id));
                try {
                    const data = await api.getArticleChildren(id, locale);
                    setChildrenMap((m) => ({ ...m, [id]: byPosition(data) }));
                } catch {
                    /* игнорируем */
                }
                setLoadingIds((s) => {
                    const n = new Set(s);
                    n.delete(id);
                    return n;
                });
            },
            [api, locale]
        );

        const toggle = useCallback(
            (node: ArticleNodeDto) => {
                setExpanded((s) => {
                    const n = new Set(s);
                    if (n.has(node.id)) {
                        n.delete(node.id);
                    } else {
                        n.add(node.id);
                        if (!childrenMap[node.id]) loadChildren(node.id);
                    }
                    return n;
                });
            },
            [childrenMap, loadChildren]
        );

        // Сдвиг страницы среди соседей (вверх/вниз). Оптимистично + сохраняем порядок.
        const reorder = useCallback(
            (node: ArticleNodeDto, dir: "up" | "down") => {
                const isRoot = node.parentId == null;
                const parentId = node.parentId as number;
                const siblings = isRoot ? roots : childrenMap[parentId] || [];

                const i = siblings.findIndex((n) => n.id === node.id);
                const j = i + (dir === "up" ? -1 : 1);
                if (i < 0 || j < 0 || j >= siblings.length) return;

                const next = siblings.slice();
                [next[i], next[j]] = [next[j], next[i]];

                if (isRoot) setRoots(next);
                else setChildrenMap((m) => ({ ...m, [parentId]: next }));

                api.reorderArticles(
                    wiki,
                    next.map((n) => n.id)
                ).catch(() => {
                    // откат к прежнему порядку
                    if (isRoot) setRoots(siblings);
                    else setChildrenMap((m) => ({ ...m, [parentId]: siblings }));
                });
            },
            [api, wiki, roots, childrenMap]
        );

        useImperativeHandle(
            ref,
            () => ({
                refresh: async () => {
                    try {
                        setRoots(byPosition(await api.getWikiArticles(wiki, locale)));
                    } catch {
                        /* оставляем прежние корни */
                    }
                    const ids = Array.from(expanded);
                    const entries = await Promise.all(
                        ids.map((id) =>
                            api
                                .getArticleChildren(id, locale)
                                .then((c) => [id, byPosition(c)] as const)
                                .catch(() => [id, childrenMap[id] || []] as const)
                        )
                    );
                    setChildrenMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
                },
                getNode: (url: string) => {
                    const inRoots = roots.find((n) => n.url === url);
                    if (inRoots) return inRoots;
                    for (const list of Object.values(childrenMap)) {
                        const found = list.find((n) => n.url === url);
                        if (found) return found;
                    }
                    return undefined;
                },
            }),
            [api, wiki, locale, expanded, childrenMap, roots]
        );

        const renderNodes = (nodes: ArticleNodeDto[], depth: number): React.ReactNode =>
            nodes.map((node, index) => {
                const isExpanded = expanded.has(node.id);
                const children = childrenMap[node.id];
                const isActive = node.url === currentUrl;
                const isFirst = index === 0;
                const isLast = index === nodes.length - 1;

                return (
                    <React.Fragment key={node.id}>
                        <div
                            className={
                                "wiki-tree-row" +
                                (isActive ? " is-active" : "") +
                                (node.hidden ? " is-hidden" : "")
                            }
                            style={{ paddingLeft: depth * INDENT }}
                        >
                            <span
                                className={"wiki-tree-caret" + (node.hasChild ? "" : " is-leaf")}
                                onClick={node.hasChild ? () => toggle(node) : undefined}
                            >
                                {node.hasChild && (
                                    <Icon fitted name={isExpanded ? "caret down" : "caret right"} />
                                )}
                            </span>

                            <NavLink
                                className={"wiki-tree-link" + (node.hasPayload ? "" : " is-empty")}
                                to={`/wiki/${wiki}/${node.url}`}
                                title={node.url}
                            >
                                {node.title || node.url}
                            </NavLink>

                            {canEdit && (
                                <span className="wiki-tree-actions">
                                    <Icon
                                        link={!isFirst}
                                        disabled={isFirst}
                                        className="wiki-tree-action"
                                        name="angle up"
                                        title="Выше"
                                        onClick={isFirst ? undefined : () => reorder(node, "up")}
                                    />
                                    <Icon
                                        link={!isLast}
                                        disabled={isLast}
                                        className="wiki-tree-action"
                                        name="angle down"
                                        title="Ниже"
                                        onClick={isLast ? undefined : () => reorder(node, "down")}
                                    />
                                    <Icon
                                        link
                                        className="wiki-tree-action"
                                        name="exchange"
                                        title="Переместить страницу"
                                        onClick={() => onMove(node)}
                                    />
                                    <Icon
                                        link
                                        className="wiki-tree-action"
                                        name="plus"
                                        title="Добавить дочернюю страницу"
                                        onClick={() => onAddChild(node)}
                                    />
                                </span>
                            )}

                            {(node.hidden || node.locked) && (
                                <span className="wiki-tree-flags">
                                    {node.hidden && (
                                        <Icon fitted name="eye slash" title="Скрытая" />
                                    )}
                                    {node.locked && <Icon fitted name="lock" title="Заблокированная" />}
                                </span>
                            )}
                        </div>

                        {isExpanded &&
                            (loadingIds.has(node.id) ? (
                                <Loader
                                    active
                                    inline
                                    size="tiny"
                                    style={{ marginLeft: (depth + 1) * INDENT, marginTop: 4 }}
                                />
                            ) : (
                                children && renderNodes(children, depth + 1)
                            ))}
                    </React.Fragment>
                );
            });

        return (
            <div className="wiki-sidebar">
                {loadingRoots && roots.length === 0 ? (
                    <Loader active inline />
                ) : (
                    renderNodes(roots, 0)
                )}

                {canEdit && (
                    <Button
                        basic
                        fluid
                        size="tiny"
                        icon="plus"
                        content="Создать страницу"
                        style={{ marginTop: 14 }}
                        onClick={() => onAddChild(null)}
                    />
                )}
            </div>
        );
    }
);

export default WikiSidebar;
