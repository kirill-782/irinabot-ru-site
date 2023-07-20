import { config } from "process";
import React, { useContext } from "react";
import { AppRuntimeSettingsContext } from "../../context";
import { Message } from "semantic-ui-react";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import Markdown from "../Markdown";

interface ConfigPreviewProps {
  config: ConfigInfo;
}

function ConfigPreview({ config }: ConfigPreviewProps) {
  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  return <Message info><Markdown light>{t("other.config.preview", {configName: config.name, version: config.version})}</Markdown></Message>;
}

export default ConfigPreview;
