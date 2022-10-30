import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";
import remarkTypograf from "@mavrin/remark-typograf";
import remarkEmoji from "remark-emoji";

import SyntaxHighlighter from "react-syntax-highlighter";
import { docco, dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { currentTheme, E_THEME } from "../utils/Theme";
import React from "react";

import { Image, Table } from "semantic-ui-react";

interface MarkdownProps {
  children: string;
}

function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        remarkTypograf,
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
          return <Image {...props} size="medium" centered wrapped></Image>;
        },
        table({ node, children, ...props }) {
          return <Table>{children}</Table>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

export default Markdown;
