import React, { useContext } from "react";
import { Button, Header, Message, Segment, Table } from "semantic-ui-react";
import copy from "clipboard-copy";

import { ReplayContext } from "../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";
import LanguageKey from "../LanguageKey";
import ReplaySlotPlayer from "./ReplaySlotPlayer";
import { parseHCL } from "../../utils/HCLParser";
import { getColorClass, isObserverSlot } from "../../utils/ReplayFormat";

function ReplayHcl() {
    const { replayData } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const slots = replayData.records.startInfo?.slots || [];
    const hcl = parseHCL(replayData.records.startInfo?.slots);

    return (
        <div className="replay-hcl">
            <Message info>
                <LanguageKey stringId="replayHclDescription" />
            </Message>

            {hcl.hasHcl ? (
                <Segment>
                    <Header size="small">{t("replayHclCommandString")}</Header>
                    <div className="hcl-value">
                        <code className="hcl-string">{hcl.commandString}</code>
                        <Button
                            size="mini"
                            basic
                            icon="copy"
                            title={t("copy")}
                            content={t("copy")}
                            onClick={() => copy(hcl.commandString)}
                        />
                    </div>
                </Segment>
            ) : (
                <Message content={slots.length ? t("replayHclNotFound") : t("replayPlayersNoSlots")} />
            )}

            {hcl.hasInvalidHandicap && <Message error content={t("replayHclInvalidHandicap")} />}

            {hcl.slots.length > 0 && (
                <>
                    <Header size="small">{t("replayHclSlotsHeader")}</Header>
                    <div className="table-scroll">
                        <Table celled compact unstackable>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell collapsing>{t("replayPlayersSlot")}</Table.HeaderCell>
                                    <Table.HeaderCell>{t("replayPlayersName")}</Table.HeaderCell>
                                    <Table.HeaderCell collapsing>{t("replayHclEncodedHandicap")}</Table.HeaderCell>
                                    <Table.HeaderCell collapsing>{t("replayHclChar")}</Table.HeaderCell>
                                    <Table.HeaderCell collapsing>{t("replayHclOriginalHandicap")}</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {hcl.slots.map((decoded) => {
                                    const slot = slots[decoded.slotIndex];

                                    return (
                                        <Table.Row key={decoded.slotIndex} negative={decoded.invalid}>
                                            <Table.Cell collapsing>
                                                {slot && !isObserverSlot(slot, slots.length) && (
                                                    <span className={`wc3-color ${getColorClass(slot.color)}`} />
                                                )}
                                                {decoded.slotIndex + 1}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <ReplaySlotPlayer slot={slot} />
                                            </Table.Cell>
                                            <Table.Cell collapsing>{decoded.handicap}</Table.Cell>
                                            <Table.Cell collapsing>
                                                {/* Пробел — легальный символ HCL, но в ячейке его не видно. */}
                                                {decoded.char ? (
                                                    <code title={decoded.char === " " ? t("replayHclSpaceChar") : undefined}>
                                                        {decoded.char === " " ? "␣" : decoded.char}
                                                    </code>
                                                ) : (
                                                    "—"
                                                )}
                                            </Table.Cell>
                                            <Table.Cell collapsing>{decoded.invalid ? "—" : `${decoded.originalHandicap}%`}</Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table>
                    </div>
                </>
            )}
        </div>
    );
}

export default ReplayHcl;
