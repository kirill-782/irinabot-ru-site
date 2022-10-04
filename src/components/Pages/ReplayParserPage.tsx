import React, {
  createContext,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { Container } from "semantic-ui-react";

import "./ReplayParserPage.scss";
import {
  ReplayResult,
  AvailableActionData,
  ActionParser,
  ActionCommandBlock,
} from "@kokomi/w3g-parser-browser";
import OpenReplay from "../ReplayParser/OpenReplay";
import ReplayInfo from "../ReplayParser/ReplayInfo";

export const ReplayContext = createContext<ReplayContextData | null>(null);

export type ActionData = {
  commandBlocks: ActionCommandBlock[];
  time: number;
  errorMessage?: string;
};

export interface ReplayContextData {
  replayData: ReplayResult;
  replayActions: ActionData[];
  name: string;
}

function ReplayParserPage({}) {
  const [replayData, setReplayData] = useState<ReplayResult>();
  const [replayActions, setReplayActions] = useState<ActionData[]>([]);
  const [name, setName] = useState<string>("");

  const onReplayData = (name: string, data: ReplayResult) => {
    setReplayData(data);
    setName(name);
    const actions: ActionData[] = [];

    const actionParser = new ActionParser();

    debugger;

    data.records.actions.forEach((i) => {
      try {
        const result = actionParser.processActionData(i.rawData);
        actions.push({
          commandBlocks: result,
          time: i.time,
        });
      } catch (e) {
        actions.push({
          commandBlocks: [],
          time: i.time,
          errorMessage: e.toString(),
        });
      }
    });

    setReplayActions(actions);
  };

  return (
    <Container className="replay-parser">
      {replayData ? (
        <ReplayContext.Provider
          value={{
            replayData,
            replayActions,
            name
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
