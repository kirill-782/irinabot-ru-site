import React, { useContext } from "react";
import { AppRuntimeSettingsContext } from "../../context";

function TelegramAuthStubPage() {
    const urlParser = new URLSearchParams(window.location.hash.substring(1));
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    if (urlParser.has("tgAuthResult"))
        localStorage.setItem(urlParser.get("state") + "_token", urlParser.get("tgAuthResult") || "");
    else {
        localStorage.setItem(
            urlParser.get("state") + "_error",
            urlParser.get("error") + ": " + urlParser.get("error_description")
        );
    }

    window.close();

    return <span>{lang.oathStubPageText}</span>;
}

export default TelegramAuthStubPage;
