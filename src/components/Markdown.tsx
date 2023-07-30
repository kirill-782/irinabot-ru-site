import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";
import remarkTypograf from "@mavrin/remark-typograf";
import remarkEmoji from "remark-emoji";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";

import SyntaxHighlighter from "react-syntax-highlighter";
import { docco, dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { currentTheme, E_THEME } from "../utils/Theme";
import React from "react";

import { Image, Table, Message } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import WarcraftIIIText from "./WarcraftIIIText";

declare global {
    namespace JSX {
        // this merges with the existing intrinsic elements, adding 'my-custom-tag' and its props
        interface IntrinsicElements {
            "w3c": {
                children: React.ReactNode;
                color: string;
            };
        }
    }
}

interface MarkdownProps {
    children: string;
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
                img({ node, ...props }) {
                    return <Image {...props} />;
                },
                table({ node, children, ...props }) {
                    return <div style={{ overflowX: "scroll" }}>
                        <Table striped>{children}</Table>
                    </div>;
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
                    return href?.match(new RegExp("^(?:[a-z+]+:)?//", "i"))
                        ? <a href={href} {...props} rel="nofollow noreferrer" target="_blank">{children}</a>
                        : <NavLink to={href} {...props}>{children}</NavLink>;
                },
                w3c({ node, children, color }) {
                    return <WarcraftIIIText style={{color}} ignoreTags={["|n"]} enableAlpha>{children}</WarcraftIIIText>;
                },
            }}
        >
            {children}
        </ReactMarkdown>
    );
}

export default Markdown;
