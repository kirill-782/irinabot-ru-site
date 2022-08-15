import { ReactNode } from "react";
import { parseWC3TagsReact } from "../utils/WC3TestUtils";

interface WarcraftIIITextProps {
  escapeTags?: string[];
  ignoreTags?: string[];
  children?: ReactNode;
}

function WarcraftIIIText({ ignoreTags, children }: WarcraftIIITextProps) {
  if (typeof children !== "string" && !(children instanceof String))
    console.error("children is not string");

  return !children ? null : (
    <span>{parseWC3TagsReact(children.toString(), ignoreTags)}</span>
  );
}

export default WarcraftIIIText;
