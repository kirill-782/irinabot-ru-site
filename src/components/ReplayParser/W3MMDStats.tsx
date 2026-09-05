import React, { useContext, useMemo } from "react";
import { Grid } from "semantic-ui-react";
import { Resizable } from "re-resizable";

import { ActionData, ReplayContext } from "../Pages/ReplayParserPage";
import { W3MMDStatsParser, W3MMDStatsState } from "../../utils/W3MMDParser";
import ShortBlockCardList from "./ShortBlockCardList";
import JSONHighlighter from "./JSONHighlighter";

import "./W3MMDStats.scss";

// W3MMD передаётся действием SyncStoredInteger (0x6b).
const ACTION_SYNC_STORED_INTEGER = 0x6b;

interface W3MMDResult {
    state: W3MMDStatsState;
    /** Блоки, после которых состояние статистики изменилось, — по ним удобно листать историю. */
    meaningfulBlocks: ActionData[];
}

function W3MMDStats() {
    const { replayActions } = useContext(ReplayContext)!;

    const { state, meaningfulBlocks } = useMemo<W3MMDResult>(() => {
        const parser = new W3MMDStatsParser();
        const blocks: ActionData[] = [];

        replayActions.forEach((action) => {
            const hasSync = action.commandBlocks.some((commandBlock) =>
                commandBlock.actions.some((i) => i.type === ACTION_SYNC_STORED_INTEGER)
            );

            if (!hasSync) return;

            const previousState = parser.state;

            parser.processActions(action.commandBlocks, action.time);

            if (parser.state !== previousState) blocks.push(action);
        });

        return { state: parser.state, meaningfulBlocks: blocks };
    }, [replayActions]);

    return (
        <Grid className="w3mmd-tab" celled>
            <Resizable className="column block-list" minWidth="150px" maxWidth="40%" enable={{ right: true }}>
                <ShortBlockCardList actionsBlocks={meaningfulBlocks} />
            </Resizable>
            <Grid.Column className="state" width={16}>
                <JSONHighlighter data={state} />
            </Grid.Column>
        </Grid>
    );
}

export default W3MMDStats;
