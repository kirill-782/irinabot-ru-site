import {
    PlayerInfo,
    ReforgedPlayerMetadataRecord,
    ReforgedPlayerProfile,
    ReplayResult,
    SlotInfo,
    StatStringData,
} from "@kokomi/w3g-parser-browser";
import { LanguageRepositoryKeys } from "../localization/Lang";

// Расшифровка числовых полей формата .w3g в человекочитаемый вид.
//
// Значения сверены с исходниками хостбота (git ghost/ghostpp/ghost: gameslot.h, gameprotocol.h,
// abstractmap.cpp) и с разбором в самой библиотеке @kokomi/w3g-parser-browser.

export const SLOT_STATUS_OPEN = 0;
export const SLOT_STATUS_CLOSED = 1;
export const SLOT_STATUS_OCCUPIED = 2;

export const SLOT_RACE_HUMAN = 1;
export const SLOT_RACE_ORC = 2;
export const SLOT_RACE_NIGHT_ELF = 4;
export const SLOT_RACE_UNDEAD = 8;
export const SLOT_RACE_DEMON = 16;
export const SLOT_RACE_RANDOM = 32;
export const SLOT_RACE_SELECTABLE = 64;

export const COMPUTER_TYPE_EASY = 0;
export const COMPUTER_TYPE_NORMAL = 1;
export const COMPUTER_TYPE_HARD = 2;

// Типы записей внутри сжатого потока реплея.
export const RECORD_GAME_INFO = 0x00;
export const RECORD_PLAYER = 0x16;
export const RECORD_LEAVE = 0x17;
export const RECORD_START_1 = 0x1a;
export const RECORD_START_2 = 0x1b;
export const RECORD_START_3 = 0x1c;
export const RECORD_SLOTS = 0x19;
export const RECORD_TIMESLOT_OLD = 0x1e;
export const RECORD_TIMESLOT = 0x1f;
export const RECORD_CHAT = 0x20;
export const RECORD_CHECKSUM = 0x22;
export const RECORD_REFORGED_METADATA = 0x39;

// Коды исхода игрока из записи 0x17 (gameprotocol.h, PLAYERLEAVE_*).
export const LEAVE_RESULT_DISCONNECT = 1;
export const LEAVE_RESULT_LEFT = 7;
export const LEAVE_RESULT_LOST_BUILDINGS = 8;
export const LEAVE_RESULT_WON = 9;
export const LEAVE_RESULT_DRAW = 10;
export const LEAVE_RESULT_OBSERVER = 11;
export const LEAVE_RESULT_INVALID_SAVE = 12;
export const LEAVE_RESULT_LOBBY = 13;
export const LEAVE_RESULT_GPROXY = 100;

// Причина выхода: чья сторона закрыла соединение.
export const LEAVE_REASON_REMOTE = 0x01;
export const LEAVE_REASON_LOCAL = 0x0c;
export const LEAVE_REASON_UNKNOWN = 0x0e;

// Режим чата приходит отдельным полем только для сообщений в игре (flags !== 0x10).
export const CHAT_FLAG_LOBBY = 0x10;
export const CHAT_MODE_ALL = 0x00;
export const CHAT_MODE_ALLIES = 0x01;
export const CHAT_MODE_OBSERVERS = 0x02;
export const CHAT_MODE_PRIVATE_BASE = 0x03;

// Цвета игроков Warcraft III по порядку; названия совпадают с классами в ReplayColors.scss.
export const WC3_COLOR_CLASSES = [
    "red",
    "blue",
    "teal",
    "purple",
    "yellow",
    "orange",
    "green",
    "pink",
    "gray",
    "light-blue",
    "dark-green",
    "brown",
    "maroon",
    "navy",
    "turquoise",
    "violet",
    "wheat",
    "peach",
    "mint",
    "leavender",
    "coal",
    "snow",
    "emerald",
    "peanut",
];

/**
 * Те же цвета, но значениями — для рисования на canvas, где классов нет.
 * Порядок и оттенки обязаны совпадать с ReplayColors.scss.
 */
export const WC3_COLOR_HEX = [
    "#fd0400",
    "#0142ff",
    "#17bf99",
    "#540081",
    "#bbb805",
    "#fd8b10",
    "#20bf00",
    "#e45baf",
    "#939796",
    "#7dbff1",
    "#126049",
    "#4f2a04",
    "#9b0000",
    "#0001c4",
    "#00eaff",
    "#be00fe",
    "#bfa670",
    "#f8a48a",
    "#97c167",
    "#deb7ee",
    "#282828",
    "#bfc3d1",
    "#00781e",
    "#a56f33",
];

export const getColorHex = (color?: number): string => {
    if (color === undefined) return "#939796";

    return WC3_COLOR_HEX[color] || "#939796";
};

export const getColorClass = (color?: number): string => {
    if (color === undefined) return "";

    return WC3_COLOR_CLASSES[color] || "";
};

const RACE_KEYS: { [key: number]: LanguageRepositoryKeys } = {
    [SLOT_RACE_HUMAN]: "replayRaceHuman",
    [SLOT_RACE_ORC]: "replayRaceOrc",
    [SLOT_RACE_NIGHT_ELF]: "replayRaceNightElf",
    [SLOT_RACE_UNDEAD]: "replayRaceUndead",
    [SLOT_RACE_DEMON]: "replayRaceDemon",
    [SLOT_RACE_RANDOM]: "replayRaceRandom",
};

/**
 * Раса слота. Бит SLOT_RACE_SELECTABLE означает «игрок может менять расу» и к самой расе
 * отношения не имеет, поэтому его отбрасываем.
 */
export const getRaceKey = (race?: number): LanguageRepositoryKeys => {
    if (race === undefined) return "unknown";

    return RACE_KEYS[race & ~SLOT_RACE_SELECTABLE] || "unknown";
};

export const isRaceSelectable = (race?: number) => !!race && (race & SLOT_RACE_SELECTABLE) === SLOT_RACE_SELECTABLE;

export const getSlotStatusKey = (slotStatus: number): LanguageRepositoryKeys => {
    switch (slotStatus) {
        case SLOT_STATUS_OPEN:
            return "replaySlotStatusOpen";
        case SLOT_STATUS_CLOSED:
            return "replaySlotStatusClosed";
        case SLOT_STATUS_OCCUPIED:
            return "replaySlotStatusOccupied";
        default:
            return "unknown";
    }
};

export const getComputerTypeKey = (computerType: number): LanguageRepositoryKeys => {
    switch (computerType) {
        case COMPUTER_TYPE_EASY:
            return "replayComputerEasy";
        case COMPUTER_TYPE_NORMAL:
            return "replayComputerNormal";
        case COMPUTER_TYPE_HARD:
            return "replayComputerHard";
        default:
            return "unknown";
    }
};

// Скорость в stat string закодирована как 0/1/2 (abstractmap.cpp), а не как 1/2/3 в настройках бота.
export const getSpeedKey = (speed: number): LanguageRepositoryKeys => {
    switch (speed) {
        case 0:
            return "gameOptionsSlow";
        case 1:
            return "gameOptionsMedium";
        case 2:
            return "gameOptionsFast";
        default:
            return "unknown";
    }
};

export const getVisibilityKey = (statString?: StatStringData): LanguageRepositoryKeys => {
    if (!statString) return "unknown";
    if (statString.hideTerrain) return "gameOptionsHidden";
    if (statString.mapExplored) return "gameOptionsExplored";
    if (statString.alwaysVisible) return "gameOptionsOpen";
    if (statString.default) return "gameOptionsDefault";

    return "unknown";
};

/**
 * Режим наблюдателей. Судьи кодируются отдельным флагом referees, а не значением observerMode,
 * поэтому проверяем их первыми (abstractmap.cpp: MAPOBS_REFEREES → 0x40000000).
 */
export const getObserverModeKey = (statString?: StatStringData): LanguageRepositoryKeys => {
    if (!statString) return "unknown";
    if (statString.referees) return "gameOptionsJudges";

    switch (statString.observerMode) {
        case 0:
            return "gameOptionsNo";
        case 2:
            return "gameOptionsAfterDefeat";
        case 3:
            return "gameOptionsAllObservers";
        default:
            return "unknown";
    }
};

export const getLeaveResultKey = (result?: number): LanguageRepositoryKeys => {
    switch (result) {
        case LEAVE_RESULT_DISCONNECT:
            return "replayLeaveResultDisconnect";
        case LEAVE_RESULT_LEFT:
            return "replayLeaveResultLeft";
        case LEAVE_RESULT_LOST_BUILDINGS:
            return "replayLeaveResultLostBuildings";
        case LEAVE_RESULT_WON:
            return "replayLeaveResultWon";
        case LEAVE_RESULT_DRAW:
            return "replayLeaveResultDraw";
        case LEAVE_RESULT_OBSERVER:
            return "replayLeaveResultObserver";
        case LEAVE_RESULT_INVALID_SAVE:
            return "replayLeaveResultInvalidSave";
        case LEAVE_RESULT_LOBBY:
            return "replayLeaveResultLobby";
        case LEAVE_RESULT_GPROXY:
            return "replayLeaveResultGproxy";
        default:
            return "unknown";
    }
};

export const getLeaveReasonKey = (reason?: number): LanguageRepositoryKeys => {
    switch (reason) {
        case LEAVE_REASON_REMOTE:
            return "replayLeaveReasonRemote";
        case LEAVE_REASON_LOCAL:
            return "replayLeaveReasonLocal";
        default:
            return "replayLeaveReasonUnknown";
    }
};

/** Цвет метки исхода игры: победа зелёная, поражение красная, остальное серое. */
export const getLeaveResultColor = (result?: number): "green" | "red" | "grey" => {
    switch (result) {
        case LEAVE_RESULT_WON:
            return "green";
        case LEAVE_RESULT_LOST_BUILDINGS:
            return "red";
        default:
            return "grey";
    }
};

export interface ChatTarget {
    key: LanguageRepositoryKeys;
    /**
     * Для приватного сообщения — номер ЦВЕТА получателя, а не слота: клиент кладёт в extra flags
     * 3 + colour слота (game_base.cpp: «the extra flags' first byte contains 3 plus the
     * recipient's colour»). Цвет и номер слота совпадают только в нетронутом лобби.
     */
    targetColor?: number;
}

export const getChatTarget = (flags: number, chatMode?: number): ChatTarget => {
    if (flags === CHAT_FLAG_LOBBY || chatMode === undefined) return { key: "replayChatTargetLobby" };

    switch (chatMode) {
        case CHAT_MODE_ALL:
            return { key: "replayChatTargetAll" };
        case CHAT_MODE_ALLIES:
            return { key: "replayChatTargetAllies" };
        case CHAT_MODE_OBSERVERS:
            return { key: "replayChatTargetObservers" };
        default:
            return { key: "replayChatTargetPrivate", targetColor: chatMode - CHAT_MODE_PRIVATE_BASE };
    }
};

const RECORD_KEYS: { [key: number]: LanguageRepositoryKeys } = {
    [RECORD_GAME_INFO]: "replayRecordGameInfo",
    [RECORD_PLAYER]: "replayRecordPlayer",
    [RECORD_LEAVE]: "replayRecordLeave",
    [RECORD_SLOTS]: "replayRecordSlots",
    [RECORD_START_1]: "replayRecordStart1",
    [RECORD_START_2]: "replayRecordStart2",
    [RECORD_START_3]: "replayRecordStart3",
    [RECORD_TIMESLOT_OLD]: "replayRecordTimeSlotOld",
    [RECORD_TIMESLOT]: "replayRecordTimeSlot",
    [RECORD_CHAT]: "replayRecordChat",
    [RECORD_CHECKSUM]: "replayRecordChecksum",
    [RECORD_REFORGED_METADATA]: "replayRecordReforgedMetadata",
};

export const getRecordKey = (type: number): LanguageRepositoryKeys => RECORD_KEYS[type] || "unknown";

// Поле gameType записи 0x00 — это битовая маска флагов игры (W3GS GameTypes).
// Хостбот пишет туда GetMapGameType() | UNKNOWN0 | PRIVATEGAME (game_base.cpp).
export const GAME_TYPE_SAVED_GAME = 1 << 9;
export const GAME_TYPE_PRIVATE = 1 << 11;
export const GAME_TYPE_MAKER_USER = 1 << 13;
export const GAME_TYPE_MAKER_BLIZZARD = 1 << 14;
export const GAME_TYPE_MELEE = 1 << 15;
export const GAME_TYPE_SCENARIO = 1 << 16;
export const GAME_TYPE_SIZE_SMALL = 1 << 17;
export const GAME_TYPE_SIZE_MEDIUM = 1 << 18;
export const GAME_TYPE_SIZE_LARGE = 1 << 19;
export const GAME_TYPE_OBS_FULL = 1 << 20;
export const GAME_TYPE_OBS_ON_DEATH = 1 << 21;
export const GAME_TYPE_OBS_NONE = 1 << 22;

const GAME_TYPE_FLAG_KEYS: [number, LanguageRepositoryKeys][] = [
    [GAME_TYPE_SAVED_GAME, "replayGameFlagSavedGame"],
    [GAME_TYPE_MAKER_USER, "replayGameFlagMakerUser"],
    [GAME_TYPE_MAKER_BLIZZARD, "replayGameFlagMakerBlizzard"],
    [GAME_TYPE_MELEE, "replayGameFlagMelee"],
    [GAME_TYPE_SCENARIO, "replayGameFlagScenario"],
    [GAME_TYPE_SIZE_SMALL, "replayGameFlagSizeSmall"],
    [GAME_TYPE_SIZE_MEDIUM, "replayGameFlagSizeMedium"],
    [GAME_TYPE_SIZE_LARGE, "replayGameFlagSizeLarge"],
    [GAME_TYPE_OBS_FULL, "replayGameFlagObsFull"],
    [GAME_TYPE_OBS_ON_DEATH, "replayGameFlagObsOnDeath"],
    [GAME_TYPE_OBS_NONE, "replayGameFlagObsNone"],
];

/** Разбирает маску флагов игры в набор подписей. Приватность выводится отдельной меткой. */
export const getGameTypeFlagKeys = (gameType?: number): LanguageRepositoryKeys[] => {
    if (!gameType) return [];

    return GAME_TYPE_FLAG_KEYS.filter(([mask]) => (gameType & mask) === mask).map(([, key]) => key);
};

export const isPrivateGame = (gameType?: number) => !!gameType && (gameType & GAME_TYPE_PRIVATE) === GAME_TYPE_PRIVATE;

/** Раскладка слотов из записи 0x19 (в исходниках бота — SelectMode / MapLayoutStyle). */
export const getGameModeKey = (gameMode?: number): LanguageRepositoryKeys => {
    switch (gameMode) {
        case 0x00:
            return "replayGameModeTeamRaceSelectable";
        case 0x01:
            return "replayGameModeTeamFixed";
        case 0x03:
            return "replayGameModeTeamRaceFixed";
        case 0x04:
            return "replayGameModeRandomRace";
        case 0xcc:
            return "replayGameModeLadder";
        default:
            return "unknown";
    }
};

/** 255 в поле загрузки означает «неприменимо» (компьютер, лестница), а не 255 %. */
export const formatDownloadStatus = (downloadStatus: number): string =>
    downloadStatus > 100 ? "—" : `${downloadStatus}%`;

/** Product ID хранится как четырёхсимвольный код (FourCC), например W3XP. */
export const formatFourCC = (value?: number): string => {
    if (value === undefined) return "";

    const chars = [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];

    // Незнакомый id может не быть текстом — тогда честнее показать число.
    if (chars.some((code) => code < 0x20 || code > 0x7e)) return `0x${value.toString(16)}`;

    return chars
        .reverse()
        .map((code) => String.fromCharCode(code))
        .join("");
};

export const formatHex = (data?: Uint8Array): string => {
    if (!data?.length) return "";

    return Array.from(data)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
};

export const formatUint32Hex = (value?: number): string => {
    if (value === undefined) return "";

    return (value >>> 0).toString(16).padStart(8, "0");
};

/** С патча 1.31 в поле версии лежит 10000 + минорная версия (10031 → 1.31), раньше — просто минорная. */
export const formatVersion = (version: number): string => {
    if (version >= 10000) return `1.${version - 10000}`;
    if (version < 1000) return `1.${version}`;

    return String(version);
};

export const formatBytes = (bytes?: number): string => {
    if (bytes === undefined) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

/** Имя карты без пути к папке Maps. */
export const getMapFileName = (mapPath?: string): string => {
    if (!mapPath) return "";

    const parts = mapPath.split(/[\\/]/);

    return parts[parts.length - 1] || mapPath;
};

/**
 * Все игроки реплея. Хост лежит отдельно в записи 0x00, остальные приходят записями 0x16,
 * поэтому в одном списке их нет — собираем сами.
 */
export const getReplayPlayers = (replay?: ReplayResult): PlayerInfo[] => {
    if (!replay) return [];

    const hostPlayer = replay.records.gameInfo?.hostPlayer;
    const players: PlayerInfo[] = hostPlayer ? [hostPlayer] : [];

    replay.records.players.forEach((player) => {
        if (!players.some((existing) => existing.playerId === player.playerId)) players.push(player);
    });

    return players;
};

/**
 * Профили Reforged из записей 0x39. Игра пишет запись заново при каждом изменении профиля,
 * поэтому побеждает последняя.
 */
export const getReforgedProfiles = (replay?: ReplayResult): Map<number, ReforgedPlayerProfile> => {
    const profiles = new Map<number, ReforgedPlayerProfile>();

    replay?.records.others.forEach((record) => {
        if (record.type !== RECORD_REFORGED_METADATA) return;

        const profile = (record as ReforgedPlayerMetadataRecord).profile;

        if (profile) profiles.set(profile.playerId, profile);
    });

    return profiles;
};

/**
 * Имя игрока. У классических реплеев это ник из записи игрока; в Reforged, если записи нет
 * (например, у игрока, вышедшего до старта), остаётся батлтег из профиля.
 */
export const getPlayerName = (replay?: ReplayResult, playerId?: number): string | undefined => {
    const name = getReplayPlayers(replay).find((player) => player.playerId === playerId)?.playerName;

    if (name) return name;
    if (playerId === undefined) return undefined;

    return getReforgedProfiles(replay).get(playerId)?.battleTag;
};

export const getSlotByPlayerId = (replay?: ReplayResult, playerId?: number): SlotInfo | undefined =>
    replay?.records.startInfo?.slots.find(
        (slot) => slot.slotStatus === SLOT_STATUS_OCCUPIED && slot.playerId === playerId
    );

/**
 * Наблюдатель. Команда наблюдателей — это номер, равный количеству слотов карты (12 или 24),
 * обычные команды всегда меньше (abstractmap.cpp: слоты добиваются до maxSlots, team = maxSlots).
 *
 * Цвет сверять нельзя: у наблюдателя-бота (например FLO в реплеях Reforged) он остаётся своим,
 * и проверка team === color такие слоты пропускает.
 */
export const isObserverSlot = (slot: SlotInfo, slotCount: number) => slot.team >= slotCount;
