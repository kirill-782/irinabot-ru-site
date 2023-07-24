import React, { useContext } from "react";
import { AppRuntimeSettingsContext } from "../../context";

function OauthStubPage() {
  const urlParser = new URLSearchParams(window.location.hash.substring(1));
  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  if (urlParser.has("access_token"))
    localStorage.setItem(
      urlParser.get("state") + "_token",
      urlParser.get("access_token") || ""
    );
  else {
    localStorage.setItem(
      urlParser.get("state") + "_error",
      urlParser.get("error") + ": " + urlParser.get("error_description")
    );
  }

  window.close();

  return <span>{lang.oathStubPageText}</span>;
}

export default OauthStubPage;
