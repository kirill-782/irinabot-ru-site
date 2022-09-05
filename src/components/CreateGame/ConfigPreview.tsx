import { config } from "process";
import React from "react";
import { Message } from "semantic-ui-react";
import { ConfigInfo } from "../../models/rest/ConfigInfo";

interface ConfigPreviewProps {
  config: ConfigInfo;
}

function ConfigPreview({ config }: ConfigPreviewProps) {
  return (
    <Message info>
      Вы - конгфиг {config.name} для версии {config.version}.{" "}
    </Message>
  );
}

export default ConfigPreview;
