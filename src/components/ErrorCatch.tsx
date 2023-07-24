import React, { useContext } from "react";
import { useState } from "react";
import { Container } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../context";

function ErrorCatch({ children }) {
  const [hasError, setError] = useState(false);

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  if (hasError) return <Container>{lang.siteErrorCatch}</Container>;

  try {
    return children;
  } catch (e) {
    console.error(e);
    setError(true);
  }
}

export default ErrorCatch;
