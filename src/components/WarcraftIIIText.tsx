import React, { CSSProperties } from "react";
import { ReactNode, Children } from "react";
import { parseWC3TagsReact } from "../utils/WC3TestUtils";

interface WarcraftIIITextProps {
    escapeTags?: string[];
    ignoreTags?: string[];
    children?: ReactNode;
    enableAlpha?: boolean;
    style?: CSSProperties;

}

function WarcraftIIIText({ ignoreTags, children, enableAlpha, style }: WarcraftIIITextProps) {

    const mapChildrenNodes = (i) => {
        if (typeof i === "string" || (children instanceof String))
            return <span>{parseWC3TagsReact(i.toString(), ignoreTags, enableAlpha)}</span>;

        try {
            return React.cloneElement(i, { ...i.props, children: Children.map(i.props.children, mapChildrenNodes) });
        } catch (e) {
            return i;
        }
    };

    if (style) {
        return <span style={{margin: 0, ...style}}>
            {Children.map(children, mapChildrenNodes)}
        </span>;
    }

    return Children.map(children, mapChildrenNodes);
}

export default WarcraftIIIText;
