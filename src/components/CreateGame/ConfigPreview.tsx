import { config } from "process";
import React, { useContext } from "react";
import { AppRuntimeSettingsContext } from "../../context";
import { Message } from "semantic-ui-react";
import { ConfigInfo } from "../../models/rest/ConfigInfo";

interface ConfigPreviewProps {
  config: ConfigInfo;
}

function ConfigPreview({ config }: ConfigPreviewProps) {
  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  return (
    <Message info>
      {t("other.config.preview.part1")} {config.name}{" "}
      {t("other.config.preview.part2")} {config.version}.{" "}
    </Message>
  );
}

export default ConfigPreview;
