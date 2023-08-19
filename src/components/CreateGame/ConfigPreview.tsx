import React from "react";
import { Message } from "semantic-ui-react";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import LanguageKey from "./../LanguageKey";

interface ConfigPreviewProps {
    config: ConfigInfo;
}

function ConfigPreview({ config }: ConfigPreviewProps) {
    return (
        <Message info>
            <LanguageKey stringId="configPreview" name={config.name} version={config.version} />
        </Message>
    );
}

export default ConfigPreview;
