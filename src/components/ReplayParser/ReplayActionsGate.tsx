import React, { useContext, useEffect } from "react";
import { Progress, Segment } from "semantic-ui-react";

import { ReplayContext } from "../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";

interface ReplayActionsGateProps {
    children: React.ReactNode;
}

/**
 * Обёртка для вкладок, которым нужны разобранные действия.
 *
 * Разбор запускается при первом открытии такой вкладки и идёт кусками, поэтому здесь же
 * показывается прогресс — иначе вкладка молча висела бы пустой несколько секунд.
 */
function ReplayActionsGate({ children }: ReplayActionsGateProps) {
    const { actionsStatus, actionsProgress, requestActions } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    useEffect(() => {
        requestActions();
    }, [requestActions]);

    if (actionsStatus === "ready") return <>{children}</>;

    return (
        <Segment placeholder className="replay-actions-gate">
            <Progress percent={actionsProgress} indicating progress content={t("replayActionsParsing")} />
        </Segment>
    );
}

export default ReplayActionsGate;
