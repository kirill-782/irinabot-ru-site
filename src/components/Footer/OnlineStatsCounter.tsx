import React, { useContext } from "react";
import { Menu } from "semantic-ui-react";
import { AppRuntimeSettingsContext, SiteOnlineStatsContext } from "../../context";

interface OnlineStatsCounterProps {
    showAlways?: boolean;
}

function OnlineStatsCounter({ showAlways }: OnlineStatsCounterProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const siteOnlineStats = useContext(SiteOnlineStatsContext);
    const t = language.getString;
    const connected = siteOnlineStats?.connected || 0;
    const logined = siteOnlineStats?.logined || 0;

    return showAlways || logined > 0 ? (
        <Menu.Item title={t("onlineStatsCounter", { count: connected })}>{logined}</Menu.Item>
    ) : null;
}

export default OnlineStatsCounter;
