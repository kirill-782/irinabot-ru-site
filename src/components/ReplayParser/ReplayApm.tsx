import React, { useContext, useMemo } from "react";
import { Message, Table } from "semantic-ui-react";
import prettyMilliseconds from "pretty-ms";

import { ReplayContext } from "../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";
import ReplaySlotPlayer from "./ReplaySlotPlayer";
import ApmSparkline from "./ApmSparkline";
import LanguageKey from "../LanguageKey";
import { APM_CATEGORY_KEYS, computeApm } from "../../utils/ReplayApm";
import { getColorClass, getSlotByPlayerId, isObserverSlot } from "../../utils/ReplayFormat";

function ReplayApm() {
    const { replayData, replayActions } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const apm = useMemo(() => computeApm(replayData, replayActions), [replayData, replayActions]);

    const slots = replayData.records.startInfo?.slots || [];
    // Общий максимум по минутам — чтобы спарклайны в строках сравнивались между собой.
    const peak = Math.max(0, ...apm.players.flatMap((player) => player.buckets));

    if (apm.players.length === 0) return <Message content={t("replayApmEmpty")} />;

    return (
        <div className="replay-apm">
            <Message info>
                <LanguageKey stringId="replayApmDescription" />
            </Message>

            {apm.pausedMs > 0 && (
                <Message content={t("replayApmPaused", { value: prettyMilliseconds(apm.pausedMs) })} />
            )}

            <div className="table-scroll">
                <Table celled compact unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{t("replayPlayersName")}</Table.HeaderCell>
                            <Table.HeaderCell collapsing textAlign="right">
                                APM
                            </Table.HeaderCell>
                            <Table.HeaderCell collapsing textAlign="right">
                                {t("replayApmActions")}
                            </Table.HeaderCell>
                            <Table.HeaderCell collapsing textAlign="right">
                                {t("replayApmPlayTime")}
                            </Table.HeaderCell>
                            {APM_CATEGORY_KEYS.map(({ category, key }) => (
                                <Table.HeaderCell key={category} collapsing textAlign="right">
                                    {t(key)}
                                </Table.HeaderCell>
                            ))}
                            <Table.HeaderCell collapsing>{t("replayApmChart")}</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {apm.players.map((player) => {
                            const slot = getSlotByPlayerId(replayData, player.playerId);
                            const observer = slot && isObserverSlot(slot, slots.length);

                            return (
                                <Table.Row key={player.playerId}>
                                    <Table.Cell>
                                        {slot && !observer && (
                                            <span className={`wc3-color ${getColorClass(slot.color)}`} />
                                        )}
                                        <ReplaySlotPlayer slot={slot} />
                                    </Table.Cell>
                                    <Table.Cell collapsing textAlign="right" className="apm-value">
                                        {Math.round(player.apm)}
                                    </Table.Cell>
                                    <Table.Cell collapsing textAlign="right">
                                        {player.actions}
                                    </Table.Cell>
                                    <Table.Cell collapsing textAlign="right">
                                        {prettyMilliseconds(player.activeMs)}
                                    </Table.Cell>
                                    {APM_CATEGORY_KEYS.map(({ category }) => (
                                        <Table.Cell key={category} collapsing textAlign="right">
                                            {player.categories[category]}
                                        </Table.Cell>
                                    ))}
                                    <Table.Cell collapsing>
                                        <ApmSparkline
                                            buckets={player.buckets}
                                            max={peak}
                                            getPointTitle={(minute, value) =>
                                                t("replayApmPointTitle", { minute, value })
                                            }
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
            </div>
        </div>
    );
}

export default ReplayApm;
