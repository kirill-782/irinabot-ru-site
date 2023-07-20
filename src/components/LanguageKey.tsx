import React, { useContext } from "react";
import { LanguageKey } from "../localization/Lang.ru";
import { AppRuntimeSettingsContext } from "../context";
import Markdown from "./Markdown";

interface LanguageKeyProps {
  stringId: LanguageKey,

  [key: string]: string
}

function LanguageKey({ stringId, ...options }: LanguageKeyProps) {

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  return <Markdown>
    {t(stringId, options)}
  </Markdown>;

}

export default LanguageKey;