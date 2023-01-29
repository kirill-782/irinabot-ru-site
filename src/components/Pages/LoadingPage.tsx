import React, { useContext } from "react";
import { Loader } from "semantic-ui-react";
import {AppRuntimeSettingsContext} from "../../context"

function LoadingPage() {
  const {language} = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  return (
    <Loader active size="massive">
      {t("page.loading")}
    </Loader>
  );
}

export default LoadingPage;
