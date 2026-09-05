import { ReplayResult } from "@kokomi/w3g-parser-browser";
import { ActionData } from "../hooks/useReplayActions";
import { ChatTarget, getChatTarget } from "./ReplayFormat";

// Сводная лента событий реплея: чат, выходы игроков, паузы и сохранения в одном порядке.
//
// Чат и выходы доступны сразу после разбора реплея. Паузы, сейвы и смена скорости живут
// в действиях, поэтому появляются только когда те разобраны — лента строится и без них.

const ACTION_PAUSE = 0x01;
const ACTION_RESUME = 0x02;
const ACTION_SET_SPEED = 0x03;
const ACTION_SAVE_GAME = 0x06;

export type TimelineEventType = "chat" | "leave" | "pause" | "resume" | "save" | "speed";

export interface TimelineEvent {
    /** Игровое время события, миллисекунды. */
    time: number;
    type: TimelineEventType;
    playerId?: number;
    /** Текст сообщения для type === "chat". */
    message?: string;
    /** Адресат сообщения для type === "chat". */
    chatTarget?: ChatTarget;
    /** Код исхода для type === "leave". */
    result?: number;
    /** Причина выхода для type === "leave". */
    reason?: number;
    /** Имя файла для type === "save". */
    fileName?: string;
    /** Значение скорости для type === "speed". */
    speed?: number;
    /** Длительность паузы для type === "resume", миллисекунды. */
    pauseDurationMs?: number;
}

export interface TimelineResult {
    events: TimelineEvent[];
    /** Суммарная длительность пауз, миллисекунды. */
    pausedMs: number;
    /** В ленту вошли события из разобранных действий. */
    hasActionEvents: boolean;
}

/**
 * @param replayActions разобранные действия; без них лента состоит только из чата и выходов
 */
export const buildTimeline = (replay: ReplayResult, replayActions?: ActionData[]): TimelineResult => {
    const events: TimelineEvent[] = [];

    replay.records.chatMessages.forEach((message) => {
        events.push({
            time: message.time,
            type: "chat",
            playerId: message.playerId,
            message: message.message,
            chatTarget: getChatTarget(message.flags, message.chatMode),
        });
    });

    replay.records.playerLeave.forEach((leave) => {
        events.push({
            time: leave.time,
            type: "leave",
            playerId: leave.playerId,
            result: leave.result,
            reason: leave.reason,
        });
    });

    let pausedMs = 0;
    let pausedAt: number | undefined;
    let hasActionEvents = false;

    replayActions?.forEach((block) => {
        block.commandBlocks.forEach((commandBlock) => {
            commandBlock.actions.forEach((action) => {
                if (action.type === ACTION_PAUSE) {
                    if (pausedAt === undefined) pausedAt = block.time;

                    hasActionEvents = true;
                    events.push({ time: block.time, type: "pause", playerId: commandBlock.playerId });

                    return;
                }

                if (action.type === ACTION_RESUME) {
                    const duration = pausedAt === undefined ? undefined : block.time - pausedAt;

                    if (duration !== undefined) pausedMs += duration;

                    pausedAt = undefined;
                    hasActionEvents = true;
                    events.push({
                        time: block.time,
                        type: "resume",
                        playerId: commandBlock.playerId,
                        pauseDurationMs: duration,
                    });

                    return;
                }

                if (action.type === ACTION_SAVE_GAME) {
                    hasActionEvents = true;
                    events.push({
                        time: block.time,
                        type: "save",
                        playerId: commandBlock.playerId,
                        fileName: (action as { fileName?: string }).fileName,
                    });

                    return;
                }

                if (action.type === ACTION_SET_SPEED) {
                    hasActionEvents = true;
                    events.push({
                        time: block.time,
                        type: "speed",
                        playerId: commandBlock.playerId,
                        speed: (action as { speed?: number }).speed,
                    });
                }
            });
        });
    });

    // Порядок внутри одного времени сохраняем как есть: чат и выходы уже идут в порядке записей.
    events.sort((a, b) => a.time - b.time);

    return { events, pausedMs, hasActionEvents };
};

/** Реальное время события: игровое плюс паузы, набежавшие до него. */
export const toRealTime = (events: TimelineEvent[]): number[] => {
    const result: number[] = [];

    let paused = 0;
    let pausedAt: number | undefined;

    events.forEach((event) => {
        if (event.type === "pause" && pausedAt === undefined) pausedAt = event.time;

        result.push(event.time + paused);

        if (event.type === "resume" && pausedAt !== undefined) {
            paused += event.pauseDurationMs ?? event.time - pausedAt;
            pausedAt = undefined;
        }
    });

    return result;
};
