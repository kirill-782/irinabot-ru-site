import { useCallback, useEffect, useRef, useState } from "react";
import { ActionCommandBlock, ActionParser, ReplayResult } from "@kokomi/w3g-parser-browser";

export interface ActionData {
    commandBlocks: ActionCommandBlock[];
    time: number;
    errorMessage?: string;
    seqenceNumber: number;
    rawData?: Uint8Array;
}

export type ReplayActionsStatus = "idle" | "parsing" | "ready";

export interface UseReplayActionsResult {
    actions: ActionData[];
    status: ReplayActionsStatus;
    /** Процент разобранных таймслотов, 0..100. */
    progress: number;
    /** Запускает разбор. Повторные вызовы игнорируются. */
    parse: () => void;
}

// За один проход обрабатываем ограниченное число таймслотов и отдаём поток браузеру:
// в часовой игре их больше сотни тысяч, и разбор одним куском вешает вкладку на секунды.
const CHUNK_SIZE = 4000;

/**
 * Ленивый разбор действий (записи 0x1f/0x1e) реплея.
 *
 * Панели с обычными данными реплея в нём не нуждаются, а он самый дорогой этап парсинга,
 * поэтому запускается только по требованию — из вкладок блоков и W3MMD.
 */
export const useReplayActions = (replay?: ReplayResult): UseReplayActionsResult => {
    const [actions, setActions] = useState<ActionData[]>([]);
    const [status, setStatus] = useState<ReplayActionsStatus>("idle");
    const [progress, setProgress] = useState(0);

    // Статус нужен и внутри цепочки таймеров, где замыкание видит устаревшее значение.
    const statusRef = useRef<ReplayActionsStatus>("idle");
    const timerRef = useRef<number>();

    const stopTimer = () => {
        if (timerRef.current !== undefined) {
            window.clearTimeout(timerRef.current);
            timerRef.current = undefined;
        }
    };

    useEffect(() => {
        stopTimer();

        statusRef.current = "idle";
        setActions([]);
        setStatus("idle");
        setProgress(0);

        return stopTimer;
    }, [replay]);

    const parse = useCallback(() => {
        if (!replay || statusRef.current !== "idle") return;

        statusRef.current = "parsing";
        setStatus("parsing");

        const parser = new ActionParser();
        const timeSlots = replay.records.actions;
        const result: ActionData[] = [];

        let index = 0;

        const step = () => {
            const chunkEnd = Math.min(timeSlots.length, index + CHUNK_SIZE);

            for (; index < chunkEnd; ++index) {
                const timeSlot = timeSlots[index];

                try {
                    result.push({
                        commandBlocks: parser.processActionData(timeSlot.rawData),
                        time: timeSlot.time,
                        seqenceNumber: index,
                    });
                } catch (e) {
                    result.push({
                        commandBlocks: [],
                        time: timeSlot.time,
                        errorMessage: String(e),
                        seqenceNumber: index,
                        rawData: timeSlot.rawData,
                    });
                }
            }

            if (index < timeSlots.length) {
                setProgress(Math.round((index / timeSlots.length) * 100));
                timerRef.current = window.setTimeout(step, 0);

                return;
            }

            timerRef.current = undefined;
            statusRef.current = "ready";
            setActions(result);
            setProgress(100);
            setStatus("ready");
        };

        step();
    }, [replay]);

    return { actions, status, progress, parse };
};
