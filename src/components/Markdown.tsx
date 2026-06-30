import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";
import remarkTypograf from "@mavrin/remark-typograf";
import remarkEmoji from "remark-emoji";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";

import SyntaxHighlighter from "react-syntax-highlighter";
import { docco, dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { currentTheme, E_THEME } from "../utils/Theme";
import React, { memo } from "react";

import { Image, Table, Message, Accordion, Icon, Divider } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import WarcraftIIIText from "./WarcraftIIIText";
import Spoiler from "./Spoiler";
import ContentPointer, { parsePointer } from "./ContentPointer";
import WikiFileImage, { parseFilePointer } from "./WikiFileImage";
import WikiFileLink from "./WikiFileLink";

// id файла вики из старого markdown-пути /v1/files/{id} (обратная совместимость)
const WIKI_FILE_RE = /\/v1\/files\/([^/?#]+)/;

declare global {
    namespace JSX {
        // this merges with the existing intrinsic elements, adding 'my-custom-tag' and its props
        interface IntrinsicElements {
            w3c: {
                children: React.ReactNode;
                color: string;
            };
            cat: {
                title?: string;
                children: React.ReactNode;
            };
        }
    }
}

interface MarkdownProps {
    children?: string;
    light?: boolean;
}

function Markdown({ children, light }: MarkdownProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[
                remarkGfm,
                remarkTypograf,
                remarkDirective,
                remarkDirectiveRehype,
                [
                    remarkEmoji,
                    {
                        padSpaceAfter: false,
                        emoticon: true,
                    },
                ],
            ]}
            components={{
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                        <SyntaxHighlighter
                            children={String(children).replace(/\n$/, "")}
                            style={currentTheme === E_THEME.LIGHT ? docco : dark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                        />
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                img({ node, src, ...props }) {
                    // Картинка-файл по указателю file(uuid) либо по старому пути /v1/files/{id}.
                    const fileId = parseFilePointer(src) || (src ? WIKI_FILE_RE.exec(src)?.[1] : undefined);
                    if (fileId) {
                        return <WikiFileImage id={fileId} {...props} />;
                    }
                    return <Image {...props} src={src} />;
                },
                table({ node, children, ...props }) {
                    return (
                        <div style={{ overflowX: "scroll" }}>
                            <Table striped>{children}</Table>
                        </div>
                    );
                },
                thead({ node, children, ...props }) {
                    return <Table.Header>{children}</Table.Header>;
                },
                tbody({ node, children, ...props }) {
                    return <Table.Body>{children}</Table.Body>;
                },
                tr({ node, children, ...props }) {
                    return <Table.Row>{children}</Table.Row>;
                },
                td({ node, children, ...props }) {
                    return <Table.Cell>{children}</Table.Cell>;
                },
                p({ node, children, ...props }) {
                    return light ? <>{children}</> : <p>{children}</p>;
                },
                a({ node, href, children, ...props }) {
                    // Указатель на контент сайта: текст "@", href вида `тип(аргумент)`.
                    const text = Array.isArray(children) ? children.join("") : children;
                    if (text === "@") {
                        const fileId = parseFilePointer(href);
                        if (fileId) return <WikiFileLink id={fileId} />;
                        if (parsePointer(href)) return <ContentPointer href={href} />;
                    }

                    return href?.match(new RegExp("^(?:[a-z+]+:)?//", "i")) ? (
                        <a href={href} {...props} rel="nofollow noreferrer" target="_blank">
                            {children}
                        </a>
                    ) : (
                        <NavLink to={href} {...props}>
                            {children}
                        </NavLink>
                    );
                },
                w3c({ node, children, color }) {
                    return (
                        <WarcraftIIIText style={{ color }} ignoreTags={["|n"]} enableAlpha>
                            {children}
                        </WarcraftIIIText>
                    );
                },
                cat({ node, title, children }) {
                    if (title) return <Spoiler title={title}>{children}</Spoiler>;

                    if (Array.isArray(children) && children.length >= 2)
                        return <Spoiler title={children[0]}>{children.slice(1)}</Spoiler>;

                        return <Spoiler title="">{children}</Spoiler>;
                },
                hr({ node, ...props }) {
                    return <Divider />;
                },
            }}
        >
            {children}
        </ReactMarkdown>
    );
}

// Мемоизируем: пока строка-разметка (children) и light не меняются, не перерисовываемся.
// Иначе перерисовки родителя (напр. обновление siteOnlineStats раз в 5с поднимает
// ре-рендер всего дерева вплоть до роутера и WikiPage) заставляют react-markdown
// пересобирать дерево, и локальный state вложенных <Spoiler> (каты) сбрасывается.
export default memo(Markdown);
