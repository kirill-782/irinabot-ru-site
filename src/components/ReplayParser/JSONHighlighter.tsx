import React, { memo } from "react";

import SyntaxHighlighter from "react-syntax-highlighter";
import { docco, dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { currentTheme, E_THEME } from "../../utils/Theme";

interface JSONHighlighterProps {
  data?: any;
}

function JSONHighlighter({ data }: JSONHighlighterProps) {
  return (
    <SyntaxHighlighter
      language="json"
      style={currentTheme === E_THEME.LIGHT ? docco : dark}
    >
      {JSON.stringify(data, undefined, 2)}
    </SyntaxHighlighter>
  );
}

export default memo(JSONHighlighter);
