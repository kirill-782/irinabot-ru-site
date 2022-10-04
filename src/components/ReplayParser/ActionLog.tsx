import React, { useContext, useState } from "react";
import { Form } from "semantic-ui-react";
import { ReplayContext } from "../Pages/ReplayParserPage";

import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

function ActionLog({}) {
  const [syncIntegerOnly, setSyncIntegerOnly] = useState(true);

  const { replayData, replayActions, name } = useContext(ReplayContext) || {};

  let renderActions = replayActions?.filter((i) => {
    return i.commandBlocks.length > 0;
  });

  if (syncIntegerOnly)
    renderActions = replayActions?.filter((i) => {
      return i.commandBlocks.some((i) => {
        return i.actions.some((i) => {
          return i.type === 107;
        });
      });
    });

  return (
    <>
      <Form>
        <Form.Group>
          <Form.Checkbox
            label="Только SyncStoredInteger"
            checked={syncIntegerOnly}
            onChange={(_, data) => {
              setSyncIntegerOnly(!!data.checked);
            }}
          ></Form.Checkbox>
        </Form.Group>
        <SyntaxHighlighter language="json" style={docco}>
          {JSON.stringify(renderActions, undefined, 2)}
        </SyntaxHighlighter>
      </Form>
    </>
  );
}

export default ActionLog;
