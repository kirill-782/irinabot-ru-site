import React, { createContext, useCallback, useContext, useState } from "react";
import { Container } from "semantic-ui-react";

import "./ReplayParserPage.scss";
import { ReplayResult } from "@kokomi/w3g-parser-browser";
import OpenReplay from "../ReplayParser/OpenReplay";
import ReplayInfo from "../ReplayParser/ReplayInfo";
import MetaRobots from "./../Meta/MetaRobots";
import { AppRuntimeSettingsContext } from "../../context";
import { ActionData, ReplayActionsStatus, useReplayActions } from "../../hooks/useReplayActions";

export const ReplayContext = createContext<ReplayContextData | null>(null);

export type { ActionData };

export interface ReplayContextData {
    replayData: ReplayResult;
    name: string;
    /** Разобранные действия. Пусты, пока не вызван requestActions. */
    replayActions: ActionData[];
    actionsStatus: ReplayActionsStatus;
    actionsProgress: number;
    /** Просит разобрать действия реплея — вкладки блоков и W3MMD зовут это при открытии. */
    requestActions: () => void;
    /** Возврат к форме открытия файла. */
    resetReplay: () => void;
    getShortBlockDescription: (block: ActionData) => string;
}

function ReplayParserPage() {
    const [replayData, setReplayData] = useState<ReplayResult>();
    const [name, setName] = useState<string>("");

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const { actions, status, progress, parse } = useReplayActions(replayData);

    const onReplayData = (fileName: string, data: ReplayResult) => {
        setReplayData(data);
        setName(fileName);
    };

    const resetReplay = useCallback(() => {
        setReplayData(undefined);
        setName("");
    }, []);

    const getShortBlockDescription = useCallback(
        (block: ActionData) => t("replayParserPageBlockHeader", { seqenceNumber: block.seqenceNumber }),
        [t]
    );

    return (
        <Container className="replay-parser">
            <MetaRobots noIndex />
            {replayData ? (
                <ReplayContext.Provider
                    value={{
                        replayData,
                        name,
                        replayActions: actions,
                        actionsStatus: status,
                        actionsProgress: progress,
                        requestActions: parse,
                        resetReplay,
                        getShortBlockDescription,
                    }}
                >
                    <ReplayInfo />
                </ReplayContext.Provider>
            ) : (
                <OpenReplay setReplayData={onReplayData} />
            )}
        </Container>
    );
}

export default ReplayParserPage;
