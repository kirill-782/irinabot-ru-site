import { GameDataShort } from "../models/rest/Game";

const getFreeSlots = (game: GameDataShort): number => {
    let usedSlots = 0;

    game.slots.forEach((slot) => {
        if (slot.player) usedSlots++;
    });

    return usedSlots;
};

export const gameTypeComparator = (a: GameDataShort, b: GameDataShort): number => {
    return compareByStarted(a, b) || compareByOtherGame(a, b);
};

export const defaultComparator = (a: GameDataShort, b: GameDataShort): number => {
    return (
        compareByPassword(a, b)
    );
};

export const freeSlotsComparator = (a: GameDataShort, b: GameDataShort): number => {
    if (Number(a.started) - Number(b.started) !== 0)
        return Number(a.started) - Number(b.started);

    return getFreeSlots(a) - getFreeSlots(b);
};

export const allSlotsComparator = (a: GameDataShort, b: GameDataShort): number => {
    if (Number(a.started) - Number(b.started) !== 0)
        return Number(a.started) - Number(b.started);

    return a.slots.length - b.slots.length;
};

export const playersOccupiedComparator = (a: GameDataShort, b: GameDataShort): number => {
    if (Number(a.started) - Number(b.started) !== 0)
        return Number(a.started) - Number(b.started);

    return a.slots.length - getFreeSlots(a) - (b.slots.length - getFreeSlots(b));
};

const compareByPassword = (a: GameDataShort, b: GameDataShort): number => {
    if (a.passwordRequired && b.passwordRequired) return 0;

    if (a.passwordRequired) return 1;

    if (b.passwordRequired) return -1;

    return 0;
};

const compareByStarted = (a: GameDataShort, b: GameDataShort): number => {
    if (a.started && b.started) return 0;

    if (a.started) return 1;

    if (b.started) return -1;

    return 0;
};

const compareByOtherGame = (a: GameDataShort, b: GameDataShort): number => {
    if (a.ownerBot.external && b.ownerBot.external) return 0;

    if (a.ownerBot.external) return 1;

    if (b.ownerBot.external) return -1;

    return 0;
};

