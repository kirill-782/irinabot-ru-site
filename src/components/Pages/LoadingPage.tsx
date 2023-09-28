import React, { useContext } from "react";
import { Loader } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";

function LoadingPage() {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    return (
        <Loader active size="massive">
            {lang.loadingPage}
        </Loader>
    );
}

export default LoadingPage;


