import React, { useContext } from "react";
import { Header, Icon, Label, Message, Popup, Segment, Table } from "semantic-ui-react";
import prettyMilliseconds from "pretty-ms";
import { SlotInfo } from "@kokomi/w3g-parser-browser";

import { ReplayContext } from "../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";
import WarcraftIIIText from "../WarcraftIIIText";
import ReplaySlotPlayer from "./ReplaySlotPlayer";
import { parseHCL } from "../../utils/HCLParser";
import {
    formatDownloadStatus,
    getColorClass,
    getLeaveReasonKey,
    getLeaveResultColor,
    getLeaveResultKey,
    getRaceKey,
    getReplayPlayers,
    isObserverSlot,
    isRaceSelectable,
    SLOT_STATUS_OCCUPIED,
} from "../../utils/ReplayFormat";

function ReplayPlayers() {
    const { replayData } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const slots = replayData.records.startInfo?.slots || [];
    const hcl = parseHCL(replayData.records.startInfo?.slots);

    // Разбор HCL идёт по занятым слотам, поэтому индексируем его по номеру слота.
    const hclBySlotIndex = new Map(hcl.slots.map((decoded) => [decoded.slotIndex, decoded]));

    const getLeaveRecord = (playerId: number) =>
        replayData.records.playerLeave.find((leave) => leave.playerId === playerId);

    // Игроки, которых нет ни в одном слоте: так выглядят наблюдатели-рефери и переподключения.
    const slotlessPlayers = getReplayPlayers(replayData).filter(
        (player) => !slots.some((slot) => slot.slotStatus === SLOT_STATUS_OCCUPIED && slot.playerId === player.playerId)
    );

    const renderHandicapCell = (slot: SlotInfo, slotIndex: number) => {
        const decoded = hclBySlotIndex.get(slotIndex);

        if (!decoded?.char) return `${slot.handicap}%`;

        // В слоте лежит закодированный HCL — показываем восстановленную фору, а сырое значение
        // прячем в подсказку, чтобы таблица не выглядела сломанной.
        return (
            <Popup
                trigger={
                    <span>
                        {decoded.originalHandicap}% <Icon name="code" size="small" color="grey" />
                    </span>
                }
                content={t("replayPlayersHandicapEncoded", { value: slot.handicap, char: decoded.char })}
            />
        );
    };

    return (
        <div className="replay-players">
            {slots.length === 0 ? (
                <Message warning content={t("replayPlayersNoSlots")} />
            ) : (
                <div className="table-scroll">
                    <Table celled compact unstackable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell collapsing>{t("replayPlayersSlot")}</Table.HeaderCell>
                                <Table.HeaderCell>{t("replayPlayersName")}</Table.HeaderCell>
                                <Table.HeaderCell collapsing>{t("replayPlayersTeam")}</Table.HeaderCell>
                                <Table.HeaderCell collapsing>{t("replayPlayersRace")}</Table.HeaderCell>
                                <Table.HeaderCell collapsing>{t("replayPlayersHandicap")}</Table.HeaderCell>
                                <Table.HeaderCell collapsing>{t("replayPlayersDownload")}</Table.HeaderCell>
                                <Table.HeaderCell collapsing>{t("replayPlayersPlayTime")}</Table.HeaderCell>
                                <Table.HeaderCell collapsing>{t("replayPlayersResult")}</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {slots.map((slot, slotIndex) => {
                                const isOccupied = slot.slotStatus === SLOT_STATUS_OCCUPIED;
                                const leave = isOccupied ? getLeaveRecord(slot.playerId) : undefined;
                                const observer = isObserverSlot(slot, slots.length);

                                return (
                                    <Table.Row key={slotIndex} disabled={!isOccupied}>
                                        <Table.Cell collapsing>
                                            {/* У наблюдателя номер цвета — служебный (12 или 24), палитры для него нет. */}
                                            {!observer && <span className={`wc3-color ${getColorClass(slot.color)}`} />}
                                            {slotIndex + 1}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <ReplaySlotPlayer slot={slot} />
                                            {observer && isOccupied && (
                                                <Label size="mini" basic content={t("replayPlayersObserver")} />
                                            )}
                                        </Table.Cell>
                                        <Table.Cell collapsing>{observer ? "—" : slot.team + 1}</Table.Cell>
                                        <Table.Cell collapsing>
                                            {t(getRaceKey(slot.race))}
                                            {isRaceSelectable(slot.race) && (
                                                <Popup
                                                    trigger={<Icon name="hand pointer" size="small" color="grey" />}
                                                    content={t("replayPlayersRaceSelectable")}
                                                />
                                            )}
                                        </Table.Cell>
                                        <Table.Cell collapsing>{isOccupied ? renderHandicapCell(slot, slotIndex) : "—"}</Table.Cell>
                                        <Table.Cell collapsing>{isOccupied ? formatDownloadStatus(slot.downloadStatus) : "—"}</Table.Cell>
                                        <Table.Cell collapsing>{leave ? prettyMilliseconds(leave.time) : "—"}</Table.Cell>
                                        <Table.Cell collapsing>
                                            {leave ? (
                                                <Popup
                                                    trigger={
                                                        <Label
                                                            size="tiny"
                                                            basic
                                                            color={getLeaveResultColor(leave.result)}
                                                            content={t(getLeaveResultKey(leave.result))}
                                                        />
                                                    }
                                                    content={t("replayPlayersLeaveReason", {
                                                        reason: t(getLeaveReasonKey(leave.reason)),
                                                    })}
                                                />
                                            ) : (
                                                "—"
                                            )}
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>
                </div>
            )}
            {slotlessPlayers.length > 0 && (
                <>
                    <Header size="small">{t("replayPlayersWithoutSlotHeader")}</Header>
                    <Segment>
                        {slotlessPlayers.map((player) => {
                            const leave = getLeaveRecord(player.playerId);

                            return (
                                <div key={player.playerId}>
                                    <WarcraftIIIText ignoreTags={["|n"]}>{player.playerName}</WarcraftIIIText>
                                    {leave && (
                                        <Label
                                            size="tiny"
                                            basic
                                            color={getLeaveResultColor(leave.result)}
                                            content={t(getLeaveResultKey(leave.result))}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </Segment>
                </>
            )}
        </div>
    );
}

export default ReplayPlayers;
