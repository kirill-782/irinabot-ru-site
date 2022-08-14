import { ReactNode } from "react";
import { parseWC3TagsReact } from "../utils/WC3TestUtils";

interface WarcraftIIITextProps {
  escapeTags?: string[]
  ignoreTags?: string[]
  children?: ReactNode
}

function WarcraftIIIText({ignoreTags, children} : WarcraftIIITextProps) {
  return !children ? null : <span>{parseWC3TagsReact(children.toString( ), ignoreTags)}</span>;
}

export default WarcraftIIIText;