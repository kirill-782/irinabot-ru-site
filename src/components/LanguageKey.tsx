import React, { useContext } from "react";
import { LanguageRepositoryKeys } from "../localization/Lang.ru";
import { AppRuntimeSettingsContext } from "../context";
import Markdown from "./Markdown";

interface LanguageKeyProps {
    stringId: LanguageRepositoryKeys;

    [key: string]: any;
}

function LanguageKey({ stringId, ...options }: LanguageKeyProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    return <Markdown light>{t(stringId, options)}</Markdown>;
}

export default LanguageKey;
