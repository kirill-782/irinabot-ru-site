import React, { useEffect, useMemo, useState, memo } from "react";
import { useContext } from "react";
import { ReplayContext } from "../Pages/ReplayParserPage";

import { W3MMDStatsParser } from "../../utils/W3MMDParser";

import { Resizable } from "re-resizable";
import { Grid } from "semantic-ui-react";
import "./W3MMDStats.scss";
import { W3MMDStatsState } from "./../../utils/W3MMDParser";
import { ActionData } from "../Pages/ReplayParserPage";

import ShortBlockCardList from "./ShortBlockCardList";
import JSONHighlighter from "./JSONHighlighter";

function W3MMDStats() {
    const { replayActions } = useContext(ReplayContext)!!;

    const [meaningfulBlocks, setMeaningfulBlocks] = useState<ActionData[]>([]);
    const [displayState, setDisplayState] = useState<W3MMDStatsState>();

    useEffect(() => {
        const mmdParser = new W3MMDStatsParser();
        const syncActions = replayActions?.filter((i) => {
            return i.commandBlocks.some((i) => {
                return i.actions.some((i) => {
                    return i.type === 107;
                });
            });
        });

        let oldState = mmdParser.state;

        syncActions?.forEach((i) => {
            mmdParser.processActions(i.commandBlocks, i.time);

            if (oldState != mmdParser.state) {
                setMeaningfulBlocks((meaningfulBlocks) => {
                    return [...meaningfulBlocks, i];
                });

                oldState = mmdParser.state;
            }
        });

        setDisplayState(mmdParser.state);
    }, [replayActions]);

    return (
        <Grid className="w3mmd-tab" celled>
            <Resizable className="column block-list" minWidth="150px" maxWidth="40%" enable={{ right: true }}>
                <ShortBlockCardList actionsBlocks={meaningfulBlocks} />
            </Resizable>
            <Grid.Column className="state" width={16}>
                <JSONHighlighter data={displayState}></JSONHighlighter>
            </Grid.Column>
        </Grid>
    );
}

export default W3MMDStats;
