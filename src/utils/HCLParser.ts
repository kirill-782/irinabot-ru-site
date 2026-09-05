import { SlotInfo } from "@kokomi/w3g-parser-browser";

// HCL (Host Command Library) — способ передать карте строку режима игры через форы слотов.
//
// Хостбот (GHost++ и его потомки, в т.ч. IrinaBot) перед стартом игры подменяет форы занятых
// слотов так, что в каждой форе оказывается закодирован один символ строки режима И исходная
// фора игрока. Карта, если она поддерживает HCL, читает GetPlayerHandicap, распознаёт
// «невалидные» форы, собирает из них строку и восстанавливает игрокам настоящие форы.
//
// Кодирование (game_base.cpp, CBaseGame::EncodeHCL):
//     HandicapIndex = (исходная фора - 50) / 10        // 0..5 для 50/60/70/80/90/100
//     CharIndex     = HCL_CHARS.indexOf(символ)        // 0..40
//     новая фора    = ENCODING_MAP[HandicapIndex + CharIndex * 6]
//
// ENCODING_MAP — это последовательность 1,2,3,... с пропуском семи «валидных» значений форы
// (0, 50, 60, 70, 80, 90, 100). Именно поэтому закодированная фора никогда не совпадает с
// обычной: если у занятого слота фора равна одному из этих семи значений, HCL в нём нет.
//
// Кодируются только первые N занятых слотов, где N — длина строки; остальные слоты остаются
// с обычными форами. Поэтому декодирование останавливается на первом слоте с обычной форой.

export const HCL_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789 -=,.";

/** Значения форы, которые хостбот не использует для кодирования (валидные форы Warcraft III). */
export const HCL_FORBIDDEN_HANDICAPS = [0, 50, 60, 70, 80, 90, 100];

/** Слот считается занятым (SLOTSTATUS_OCCUPIED), включая компьютерных игроков. */
const SLOT_STATUS_OCCUPIED = 2;

const HANDICAP_VARIANTS = 6;

const buildEncodingMap = () => {
    const map = new Uint8Array(256);
    let value = 0;

    for (let i = 0; i < 256; ++i) {
        if (HCL_FORBIDDEN_HANDICAPS.includes(value)) ++value;

        map[i] = value;
        value = (value + 1) & 0xff;
    }

    return map;
};

const ENCODING_MAP = buildEncodingMap();

// Обратная таблица строится только на рабочем диапазоне индексов (0..245 = 41 символ * 6 фор).
// Дальше значения ENCODING_MAP переполняют байт и начинают повторяться, но кодировщик туда
// никогда не попадает.
const DECODING_MAP = (() => {
    const map = new Map<number, number>();

    for (let i = 0; i < HCL_CHARS.length * HANDICAP_VARIANTS; ++i) map.set(ENCODING_MAP[i], i);

    return map;
})();

export interface HCLSlotDecode {
    /** Индекс слота в записи 0x19 реплея. */
    slotIndex: number;
    playerId: number;
    /** Фора, как она записана в реплее. */
    handicap: number;
    /** Символ строки HCL, если фора слота закодирована. */
    char?: string;
    /** Исходная фора игрока до кодирования. Для незакодированного слота равна handicap. */
    originalHandicap: number;
    /** Фора не похожа ни на обычную, ни на закодированную — реплей испорчен или это не HCL. */
    invalid?: boolean;
}

export interface HCLParseResult {
    /** В слотах найдена непустая строка HCL. */
    hasHcl: boolean;
    /** Раскодированная строка режима игры. */
    commandString: string;
    /** Разбор всех занятых слотов по порядку. */
    slots: HCLSlotDecode[];
    /** Встретилась фора, которую не удалось интерпретировать. */
    hasInvalidHandicap: boolean;
}

/** Кодирует строку HCL в форы занятых слотов — обратная операция к parseHCL, нужна для тестов. */
export const encodeHCLHandicap = (char: string, originalHandicap: number): number | undefined => {
    const charIndex = HCL_CHARS.indexOf(char);
    const handicapIndex = Math.floor((originalHandicap - 50) / 10);

    if (charIndex < 0 || handicapIndex < 0 || handicapIndex >= HANDICAP_VARIANTS) return undefined;

    return ENCODING_MAP[handicapIndex + charIndex * HANDICAP_VARIANTS];
};

/**
 * Достаёт строку режима игры (HCL) из слотов реплея.
 *
 * @param slots слоты из записи старта игры (records.startInfo.slots)
 */
export const parseHCL = (slots?: SlotInfo[]): HCLParseResult => {
    const result: HCLParseResult = {
        hasHcl: false,
        commandString: "",
        slots: [],
        hasInvalidHandicap: false,
    };

    if (!slots?.length) return result;

    // Строка обрывается на первом слоте с обычной форой — дальше идут просто форы игроков.
    let stringEnded = false;

    slots.forEach((slot, slotIndex) => {
        if (slot.slotStatus !== SLOT_STATUS_OCCUPIED) return;

        const decoded: HCLSlotDecode = {
            slotIndex,
            playerId: slot.playerId,
            handicap: slot.handicap,
            originalHandicap: slot.handicap,
        };

        if (!stringEnded) {
            if (HCL_FORBIDDEN_HANDICAPS.includes(slot.handicap)) {
                stringEnded = true;
            } else {
                const index = DECODING_MAP.get(slot.handicap);

                if (index === undefined) {
                    decoded.invalid = true;
                    result.hasInvalidHandicap = true;
                    stringEnded = true;
                } else {
                    decoded.char = HCL_CHARS[Math.floor(index / HANDICAP_VARIANTS)];
                    decoded.originalHandicap = 50 + (index % HANDICAP_VARIANTS) * 10;
                    result.commandString += decoded.char;
                }
            }
        } else if (!HCL_FORBIDDEN_HANDICAPS.includes(slot.handicap)) {
            // После окончания строки форы должны быть обычными. Если нет — реплей странный,
            // но саму строку это не портит, так что только помечаем слот.
            decoded.invalid = true;
            result.hasInvalidHandicap = true;
        }

        result.slots.push(decoded);
    });

    result.hasHcl = result.commandString.length > 0;

    return result;
};
