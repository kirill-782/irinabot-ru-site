import React, { useContext } from "react";
import { Message } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../context";

function SiteMaintenanceMessage() {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    return (
        <Message warning>
            <Message.Header>{lang.siteMaintenanceNotificationTitle}</Message.Header>
            <Message.Content>{lang.siteMaintenanceNotificationDescription}</Message.Content>
        </Message>
    );
}

export default SiteMaintenanceMessage;
