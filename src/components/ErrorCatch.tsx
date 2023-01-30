import React, { useContext } from "react";
import { useState } from "react";
import { Container } from "semantic-ui-react";
import {AppRuntimeSettingsContext} from "../context"

function ErrorCatch({ children }) {
  const [hasError, setError] = useState(false);

  const {language} = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  
  if (hasError)
    return (
      <Container>
        {t("errorCatch")}
      </Container>
    );

  try {
    return children;
  } catch (e) {
    console.error(e);
    setError(true);
  }
}

export default ErrorCatch;
