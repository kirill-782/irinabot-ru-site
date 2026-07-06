import React, { useContext } from "react";
import { Icon, SemanticICONS } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { BanlistAction } from "../../models/rest/Banlist";
import { actionLongLabel, semanticColorForAction } from "../../utils/BanlistUtils";

import "./BanlistActionText.scss";

interface BanlistActionTextProps {
    action?: BanlistAction | null;
}

const ACTION_ICON: Record<BanlistAction, SemanticICONS> = {
    NONE: "circle outline",
    NOTIFY: "bell outline",
    WARNING: "warning sign",
    CHAT_RESTRICTION: "mute",
    ENTER_GAME_RESTRICTION: "ban",
};

export const BanlistActionText: React.FC<BanlistActionTextProps> = ({ action }) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    if (!action) {
        return <span>—</span>;
    }

    return (
        <span className="banlist-action-text">
            <Icon color={semanticColorForAction(action)} name={ACTION_ICON[action]} />
            {actionLongLabel(t, action)}
        </span>
    );
};

export default BanlistActionText;
