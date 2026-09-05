import { ReplayResult } from "@kokomi/w3g-parser-browser";
import { ActionData } from "../hooks/useReplayActions";
import { LanguageRepositoryKeys } from "../localization/Lang";

// Подсчёт APM по правилам w3g_actions.txt (раздел «APM», строки 110-130 спеки).
//
// Считаются только действия, помеченные в спеке как [APM+]. Отдельно оговорены два случая:
//   0x16 «Change Selection» — засчитывается, КРОМЕ выделения, идущего сразу за снятием
//        выделения внутри одного командного блока: такую пару Warcraft генерирует сам.
//   0x19 «Select Subgroup» — почти всегда автогенерируется, надёжного способа отличить
//        нажатие TAB спека не знает, поэтому не считаем вовсе.
//
// Часы останавливаются на паузе (0x01) и идут снова на 0x02; сами паузы не считаются,
// но действия, сделанные во время паузы, засчитываются.

const ACTION_PAUSE = 0x01;
const ACTION_RESUME = 0x02;
const ACTION_CHANGE_SELECTION = 0x16;

const SELECTION_MODE_ADD = 0x01;
const SELECTION_MODE_REMOVE = 0x02;

export type ApmCategory = "orders" | "selection" | "groups" | "cancel" | "menu";

const CATEGORY_BY_ACTION: { [key: number]: ApmCategory } = {
    0x10: "orders",
    0x11: "orders",
    0x12: "orders",
    0x13: "orders",
    0x14: "orders",
    0x16: "selection",
    0x1c: "selection",
    0x17: "groups",
    0x18: "groups",
    0x1d: "cancel",
    0x1e: "cancel",
    0x61: "cancel",
    0x66: "menu",
    0x67: "menu",
};

export const APM_CATEGORY_KEYS: { category: ApmCategory; key: LanguageRepositoryKeys }[] = [
    { category: "orders", key: "replayApmCategoryOrders" },
    { category: "selection", key: "replayApmCategorySelection" },
    { category: "groups", key: "replayApmCategoryGroups" },
    { category: "cancel", key: "replayApmCategoryCancel" },
    { category: "menu", key: "replayApmCategoryMenu" },
];

/** Ширина корзины графика: одна точка на минуту игры. */
export const APM_BUCKET_MS = 60000;

export interface PlayerApm {
    playerId: number;
    /** Действия, засчитанные в APM. */
    actions: number;
    /** Все разобранные действия игрока, включая не влияющие на APM. */
    totalActions: number;
    /** Время в игре без пауз, миллисекунды. */
    activeMs: number;
    apm: number;
    categories: { [key in ApmCategory]: number };
    /** Действия по минутам игры. */
    buckets: number[];
}

export interface ApmResult {
    players: PlayerApm[];
    /** Суммарная длительность пауз, миллисекунды. */
    pausedMs: number;
    /** Число корзин у самого длинного игрока — общая ось графика. */
    bucketCount: number;
}

const emptyCategories = (): { [key in ApmCategory]: number } => ({
    orders: 0,
    selection: 0,
    groups: 0,
    cancel: 0,
    menu: 0,
});

export const computeApm = (replay: ReplayResult, replayActions: ActionData[]): ApmResult => {
    const players = new Map<number, PlayerApm>();

    let pausedMs = 0;
    let pausedAt: number | undefined;

    const playerOf = (playerId: number) => {
        let player = players.get(playerId);

        if (!player) {
            player = {
                playerId,
                actions: 0,
                totalActions: 0,
                activeMs: 0,
                apm: 0,
                categories: emptyCategories(),
                buckets: [],
            };

            players.set(playerId, player);
        }

        return player;
    };

    replayActions.forEach((block) => {
        const bucket = Math.floor(block.time / APM_BUCKET_MS);

        block.commandBlocks.forEach((commandBlock) => {
            const player = playerOf(commandBlock.playerId);

            let previousWasDeselect = false;

            commandBlock.actions.forEach((action) => {
                player.totalActions++;

                if (action.type === ACTION_PAUSE && pausedAt === undefined) pausedAt = block.time;

                if (action.type === ACTION_RESUME && pausedAt !== undefined) {
                    pausedMs += block.time - pausedAt;
                    pausedAt = undefined;
                }

                const category = CATEGORY_BY_ACTION[action.type];

                if (!category) {
                    previousWasDeselect = false;

                    return;
                }

                if (action.type === ACTION_CHANGE_SELECTION) {
                    const mode = (action as { mode?: number }).mode;
                    const skip = previousWasDeselect && mode === SELECTION_MODE_ADD;

                    previousWasDeselect = mode === SELECTION_MODE_REMOVE;

                    if (skip) return;
                } else {
                    previousWasDeselect = false;
                }

                player.actions++;
                player.categories[category]++;
                player.buckets[bucket] = (player.buckets[bucket] || 0) + 1;
            });
        });
    });

    const bucketCount = Math.max(0, ...[...players.values()].map((player) => player.buckets.length));

    players.forEach((player) => {
        const leave = replay.records.playerLeave.find((record) => record.playerId === player.playerId);
        const playedMs = (leave ? leave.time : replay.records.duration) - pausedMs;

        player.activeMs = Math.max(0, playedMs);
        player.apm = player.activeMs > 0 ? (player.actions / player.activeMs) * 60000 : 0;

        for (let i = 0; i < bucketCount; ++i) if (player.buckets[i] === undefined) player.buckets[i] = 0;
    });

    return {
        players: [...players.values()].sort((a, b) => b.apm - a.apm),
        pausedMs,
        bucketCount,
    };
};
