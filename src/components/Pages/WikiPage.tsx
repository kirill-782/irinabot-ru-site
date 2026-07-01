import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { Button, Container, Loader, Message } from "semantic-ui-react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import Markdown from "../Markdown";
import WikiSidebar, { WikiSidebarHandle } from "../Wiki/WikiSidebar";
import WikiArticleEditor from "../Wiki/WikiArticleEditor";
import WikiCreatePageModal from "../Wiki/WikiCreatePageModal";
import WikiAclModal from "../Wiki/WikiAclModal";
import WikiMovePageModal from "../Wiki/WikiMovePageModal";
import WikiAdminModal from "../Wiki/WikiAdminModal";
import WikiTokensModal from "../Wiki/WikiTokensModal";
import { useTitle } from "../../hooks/useTitle";
import { getLocale } from "../../utils/LocaleUtils";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { ArticleDto, ArticleNodeDto, WikiDto } from "../../models/rest/Wiki";
import { useWikiAccess } from "../../utils/useWikiAccess";
import "./WikiPage.scss";

function WikiPage() {
    const { wikiApi } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;
    const navigate = useNavigate();

    const { wiki, article } = useParams();
    const locale = getLocale();
    const articleUrl = article || "index";

    const sidebarRef = useRef<WikiSidebarHandle>(null);
    // url страницы, для которой после загрузки нужно сразу открыть редактор (после создания).
    const autoEditUrlRef = useRef<string | null>(null);

    // Метаданные wiki (owner/visibility) — нужны для вычисления прав (см. useWikiAccess).
    const [wikiMeta, setWikiMeta] = useState<WikiDto>();
    const access = useWikiAccess(wikiMeta);

    const [current, setCurrent] = useState<ArticleDto>();
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [editing, setEditing] = useState(false);
    // узел редактируемой статьи (его флаги hidden/locked — ArticleDto их не содержит)
    const [editNode, setEditNode] = useState<ArticleNodeDto | undefined>();

    const [createOpen, setCreateOpen] = useState(false);
    const [createParent, setCreateParent] = useState<ArticleNodeDto | null>(null);
    const [aclOpen, setAclOpen] = useState(false);
    const [tokensOpen, setTokensOpen] = useState(false);
    const [moveOpen, setMoveOpen] = useState(false);
    const [moveNode, setMoveNode] = useState<ArticleNodeDto | null>(null);
    const [adminOpen, setAdminOpen] = useState(false);

    useEffect(() => {
        if (!wiki) return;

        const controller = new AbortController();

        setEditing(false);
        setNotFound(false);
        setLoading(true);

        wikiApi
            .getArticleByUrl(wiki, articleUrl, locale, { signal: controller.signal })
            .then((data) => {
                setCurrent(data);
                setLoading(false);
                if (autoEditUrlRef.current === data.url) {
                    autoEditUrlRef.current = null;
                    setEditing(true);
                }
            })
            .catch((e) => {
                if (controller.signal.aborted) return;
                setCurrent(undefined);
                setNotFound(true);
                setLoading(false);
            });

        return () => controller.abort();
    }, [wikiApi, wiki, articleUrl, locale]);

    // Подгружаем метаданные wiki для определения владельца (прав). Ошибки/отказ — без прав.
    useEffect(() => {
        if (!wiki) {
            setWikiMeta(undefined);
            return;
        }

        const controller = new AbortController();

        wikiApi
            .getWiki(wiki, { signal: controller.signal })
            .then(setWikiMeta)
            .catch(() => {
                /* приватная без доступа или ошибка — прав владельца нет */
            });

        return () => controller.abort();
    }, [wikiApi, wiki]);

    useTitle(current?.title, "Wiki");

    const openCreate = (parent: ArticleNodeDto | null) => {
        setCreateParent(parent);
        setCreateOpen(true);
    };

    const handleCreated = (node: ArticleNodeDto) => {
        setCreateOpen(false);
        sidebarRef.current?.refresh();
        // Откроем редактор сразу после загрузки новой страницы (с её флагами).
        autoEditUrlRef.current = node.url;
        setEditNode(node);
        navigate(`/wiki/${wiki}/${node.url}`);
    };

    // Перед открытием редактора берём узел из дерева — ради текущих hidden/locked.
    const startEdit = () => {
        setEditNode(sidebarRef.current?.getNode(articleUrl));
        setEditing(true);
    };

    const handleSaved = (saved: ArticleDto, savedLocale: string) => {
        // Обновляем просмотр только если редактировали локаль, открытую на странице.
        if (savedLocale === locale) setCurrent(saved);
        setEditing(false);
        sidebarRef.current?.refresh();
    };

    const openMove = (node: ArticleNodeDto) => {
        setMoveNode(node);
        setMoveOpen(true);
    };

    const handleMoved = () => {
        setMoveOpen(false);
        sidebarRef.current?.refresh();
    };

    return (
        <Container className="extra wiki-page" style={{ padding: "1em" }}>
            {!editing && (
                <div className="wiki-topbar">
                    <h2 className="wiki-topbar__title">{current?.title}</h2>
                    <div className="wiki-topbar__actions">
                        {access.isAdmin && (
                            <Button
                                size="tiny"
                                basic
                                icon="sitemap"
                                content={t("wikiPageWikisButton")}
                                onClick={() => setAdminOpen(true)}
                            />
                        )}
                        {wiki && access.canManage && (
                            <Button
                                size="tiny"
                                basic
                                icon="users"
                                content={t("wikiPageAclButton")}
                                onClick={() => setAclOpen(true)}
                            />
                        )}
                        {wiki && access.canManage && (
                            <Button
                                size="tiny"
                                basic
                                icon="key"
                                content={t("wikiPageTokensButton")}
                                onClick={() => setTokensOpen(true)}
                            />
                        )}
                        {current && access.canEdit && (
                            <Button
                                size="tiny"
                                icon="edit"
                                content={t("wikiPageEditButton")}
                                onClick={startEdit}
                            />
                        )}
                    </div>
                </div>
            )}
            <div className="wiki-layout">
                {wiki && (
                    <div className="wiki-layout__side">
                        <WikiSidebar
                            ref={sidebarRef}
                            api={wikiApi}
                            wiki={wiki}
                            locale={locale}
                            currentUrl={articleUrl}
                            canEdit={access.canEdit}
                            onAddChild={openCreate}
                            onMove={openMove}
                        />
                    </div>
                )}

                <div className="wiki-layout__main">
                    {editing && current && wiki ? (
                        <WikiArticleEditor
                            api={wikiApi}
                            wiki={wiki}
                            article={current}
                            locale={locale}
                            initialHidden={editNode?.hidden}
                            initialLocked={editNode?.locked}
                            canDeleteFiles={access.canDeleteFiles}
                            onSaved={handleSaved}
                            onCancel={() => setEditing(false)}
                        />
                    ) : (
                        <>
                            {loading && <Loader active inline="centered" />}

                            {!loading && notFound && (
                                <Message warning>
                                    <Message.Header>{t("wikiPageNotFoundHeader")}</Message.Header>
                                    <p>
                                        {t("wikiPageNotFoundText", { url: articleUrl })}{" "}
                                        <NavLink to={`/wiki/${wiki}`}>
                                            {t("wikiPageNotFoundHomeLink")}
                                        </NavLink>
                                    </p>
                                </Message>
                            )}

                            {!loading && !notFound && <Markdown>{current?.payload}</Markdown>}
                        </>
                    )}
                </div>
            </div>

            {wiki && (
                <WikiCreatePageModal
                    open={createOpen}
                    api={wikiApi}
                    wiki={wiki}
                    locale={locale}
                    parent={createParent}
                    onClose={() => setCreateOpen(false)}
                    onCreated={handleCreated}
                />
            )}

            {wiki && (
                <WikiAclModal
                    open={aclOpen}
                    api={wikiApi}
                    wiki={wiki}
                    onClose={() => setAclOpen(false)}
                />
            )}

            {wiki && (
                <WikiTokensModal
                    open={tokensOpen}
                    api={wikiApi}
                    wiki={wiki}
                    onClose={() => setTokensOpen(false)}
                />
            )}

            {wiki && (
                <WikiMovePageModal
                    open={moveOpen}
                    api={wikiApi}
                    wiki={wiki}
                    locale={locale}
                    node={moveNode}
                    onClose={() => setMoveOpen(false)}
                    onMoved={handleMoved}
                />
            )}

            <WikiAdminModal
                open={adminOpen}
                api={wikiApi}
                currentWiki={wiki}
                onClose={() => setAdminOpen(false)}
                onNavigate={(wikiUrl) => navigate(`/wiki/${wikiUrl}`)}
            />
        </Container>
    );
}

export default memo(WikiPage);
