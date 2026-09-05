import React, { useContext, useMemo, useState } from "react";
import { Button, Checkbox, Icon, Item, Label, Message, Progress } from "semantic-ui-react";
import prettyMilliseconds from "pretty-ms";

import { ReplayContext } from "../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";
import WarcraftIIIText from "../WarcraftIIIText";
import { buildTimeline, TimelineEvent, toRealTime } from "../../utils/ReplayTimeline";
import {
    getColorClass,
    getLeaveResultColor,
    getLeaveResultKey,
    getPlayerName,
    getSlotByPlayerId,
    SLOT_STATUS_OCCUPIED,
} from "../../utils/ReplayFormat";

import "./ReplayTimeline.scss";

const EVENT_ICONS: { [key: string]: string } = {
    leave: "sign out",
    pause: "pause",
    resume: "play",
    save: "save",
    speed: "tachometer alternate",
};

function ReplayTimeline() {
    const { replayData, replayActions, actionsStatus, actionsProgress, requestActions } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [showChat, setShowChat] = useState(true);
    const [showEvents, setShowEvents] = useState(true);
    const [realTime, setRealTime] = useState(false);

    const actionsReady = actionsStatus === "ready";

    const timeline = useMemo(
        () => buildTimeline(replayData, actionsReady ? replayActions : undefined),
        [replayData, replayActions, actionsReady]
    );

    // Реальное время считается по всей ленте, поэтому индексы берём до фильтрации.
    const realTimes = useMemo(() => toRealTime(timeline.events), [timeline]);

    const slots = replayData.records.startInfo?.slots || [];

    const visible = timeline.events
        .map((event, index) => ({ event, index }))
        .filter(({ event }) => (event.type === "chat" ? showChat : showEvents));

    const getTargetName = (targetColor: number) => {
        const matches = slots.filter((slot) => slot.slotStatus === SLOT_STATUS_OCCUPIED && slot.color === targetColor);
        const name = matches.length === 1 ? getPlayerName(replayData, matches[0].playerId) : undefined;

        return name || t("replayChatTargetColorFallback", { color: targetColor });
    };

    const renderContent = (event: TimelineEvent) => {
        switch (event.type) {
            case "chat":
                return (
                    <>
                        <span className="target">
                            [
                            {event.chatTarget?.targetColor === undefined
                                ? t(event.chatTarget?.key || "unknown")
                                : `${t(event.chatTarget.key)} → ${getTargetName(event.chatTarget.targetColor)}`}
                            ]
                        </span>
                        <span className="message">{event.message}</span>
                    </>
                );
            case "leave":
                return (
                    <Label
                        size="tiny"
                        basic
                        color={getLeaveResultColor(event.result)}
                        content={t(getLeaveResultKey(event.result))}
                    />
                );
            case "pause":
                return <span className="message">{t("replayTimelinePause")}</span>;
            case "resume":
                return (
                    <span className="message">
                        {event.pauseDurationMs === undefined
                            ? t("replayTimelineResume")
                            : t("replayTimelineResumeAfter", {
                                  value: prettyMilliseconds(event.pauseDurationMs),
                              })}
                    </span>
                );
            case "save":
                return <span className="message">{t("replayTimelineSave", { name: event.fileName || "" })}</span>;
            case "speed":
                return <span className="message">{t("replayTimelineSpeed", { value: event.speed ?? "" })}</span>;
            default:
                return null;
        }
    };

    return (
        <div className="replay-timeline">
            <div className="timeline-filters">
                <Checkbox
                    toggle
                    label={t("replayTimelineShowChat")}
                    checked={showChat}
                    onChange={(_, data) => setShowChat(!!data.checked)}
                />
                <Checkbox
                    toggle
                    label={t("replayTimelineShowEvents")}
                    checked={showEvents}
                    onChange={(_, data) => setShowEvents(!!data.checked)}
                />
                <Checkbox
                    toggle
                    label={t("replayTimelineRealTime")}
                    checked={realTime}
                    disabled={timeline.pausedMs === 0}
                    onChange={(_, data) => setRealTime(!!data.checked)}
                />
            </div>

            {!actionsReady &&
                (actionsStatus === "parsing" ? (
                    <Progress percent={actionsProgress} indicating progress content={t("replayActionsParsing")} />
                ) : (
                    // Паузы и сейвы лежат в действиях, а их разбор дорогой — предлагаем, а не навязываем.
                    <Message info>
                        <Message.Content>
                            {t("replayTimelineActionsHint")}
                            <Button size="mini" basic onClick={requestActions} content={t("replayTimelineLoadEvents")} />
                        </Message.Content>
                    </Message>
                ))}

            {visible.length === 0 && <Message content={t("replayTimelineEmpty")} />}

            {visible.map(({ event, index }) => {
                const name = getPlayerName(replayData, event.playerId);
                const slot = getSlotByPlayerId(replayData, event.playerId);
                const time = realTime ? realTimes[index] : event.time;

                return (
                    <div key={index} className={`chat-row timeline-row ${event.type}`}>
                        <span className="time">({prettyMilliseconds(time)})</span>
                        {event.type !== "chat" && <Icon name={EVENT_ICONS[event.type] as never} />}
                        <Item as="a" className={`player-name ${getColorClass(slot?.color)}`}>
                            <WarcraftIIIText ignoreTags={["|n"]}>{name || t("unknown")}</WarcraftIIIText>
                        </Item>
                        {renderContent(event)}
                    </div>
                );
            })}
        </div>
    );
}

export default ReplayTimeline;
