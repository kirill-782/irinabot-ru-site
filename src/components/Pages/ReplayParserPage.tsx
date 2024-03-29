import React, { createContext, useContext, useState } from "react";
import { Container } from "semantic-ui-react";

import "./ReplayParserPage.scss";
import { ReplayResult, ActionParser, ActionCommandBlock } from "@kokomi/w3g-parser-browser";
import OpenReplay from "../ReplayParser/OpenReplay";
import ReplayInfo from "../ReplayParser/ReplayInfo";
import MetaRobots from "./../Meta/MetaRobots";
import { AppRuntimeSettingsContext } from "../../context";

export const ReplayContext = createContext<ReplayContextData | null>(null);

export type ActionData = {
    commandBlocks: ActionCommandBlock[];
    time: number;
    errorMessage?: string;
    seqenceNumber: number;
    rawData?: Uint8Array;
};

export interface ReplayContextData {
    replayData: ReplayResult;
    replayActions: ActionData[];
    name: string;
    getShortBlockDescription: (block: ActionData) => string;
}

function ReplayParserPage({}) {
    const [replayData, setReplayData] = useState<ReplayResult>();
    const [replayActions, setReplayActions] = useState<ActionData[]>([]);
    const [name, setName] = useState<string>("");

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const onReplayData = (name: string, data: ReplayResult) => {
        setReplayData(data);
        setName(name);
        const actions: ActionData[] = [];

        const actionParser = new ActionParser();

        data.records.actions.forEach((i, k) => {
            try {
                const result = actionParser.processActionData(i.rawData);
                actions.push({
                    commandBlocks: result,
                    time: i.time,
                    seqenceNumber: k,
                });
            } catch (e) {
                actions.push({
                    commandBlocks: [],
                    time: i.time,
                    errorMessage: e.toString(),
                    seqenceNumber: k,
                    rawData: i.rawData,
                });
            }
        });

        setReplayActions(actions);
    };

    const getShortBlockDescription = (block: ActionData) => {
        return lang.replayParserPageBlockHeader;
    };

    return (
        <Container className="replay-parser">
            <MetaRobots noIndex />
            {replayData ? (
                <ReplayContext.Provider
                    value={{
                        replayData,
                        replayActions,
                        name,
                        getShortBlockDescription,
                    }}
                >
                    <ReplayInfo></ReplayInfo>
                </ReplayContext.Provider>
            ) : (
                <OpenReplay setReplayData={onReplayData} />
            )}
        </Container>
    );
}

export default ReplayParserPage;
