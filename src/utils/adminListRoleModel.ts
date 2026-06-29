import { RoleDraft } from "../components/AdminList/interfaces";
import { toDateTimeLocalInputValue } from "./AdminListUtils";

// Модель ролей админ-листа на стороне фронта (словаря с бэкенда пока нет).
// Источник истины — game_commands.md: маппинг команда→право и флаги доступа.
//
// Базовая модель: права (PERMISSION_*) первичны — это AccessMask бота. Команды
// (COMMAND_*) вторичны: каждая привязана к управляющему праву, а проверка доступа
// к самой команде опциональна и может игнорироваться сервером.

// --- Иерархии прав (от младшего к старшему; каждое следующее включает предыдущие) ---
export const ROLE_HIERARCHIES: readonly string[][] = [
    [
        "PERMISSION_BAN_LIST_VIEW",
        "PERMISSION_BAN_LIST_VIOLATIONS_TRACK",
        "PERMISSION_BAN_LIST_INSERT",
        "PERMISSION_BAN_LIST_MANAGE",
    ],
    ["PERMISSION_ADMIN_LIST_VIEW", "PERMISSION_ADMIN_LIST_INSERT", "PERMISSION_ADMIN_LIST_MANAGE"],
];

// Порядок секций прав. Цепочки задаются стартовой ролью; одиночные права — как есть.
export const PERMISSION_GROUP_ORDER: readonly string[] = [
    "PERMISSION_GAME_MANAGE",
    "PERMISSION_PLAYER_LIST_MANAGE",
    "PERMISSION_BAN_LIST_VIEW",
    "PERMISSION_ADMIN_LIST_VIEW",
];

// Порядок групп команд (по управляющему праву).
export const COMMAND_GROUP_ORDER: readonly string[] = [
    "PERMISSION_GAME_MANAGE",
    "PERMISSION_PLAYER_LIST_MANAGE",
    "PERMISSION_BAN_LIST_INSERT",
    "PERMISSION_BAN_LIST_MANAGE",
];

// Команда → управляющее право (из game_commands.md).
// Для команд с альтернативами (OR) берём первичное право из таблицы прав.
export const COMMAND_PERMISSION: Record<string, string> = {
    // PERMISSION_GAME_MANAGE
    COMMAND_ABORT: "PERMISSION_GAME_MANAGE",
    COMMAND_ANNOUNCE: "PERMISSION_GAME_MANAGE",
    COMMAND_AUTOSAVE: "PERMISSION_GAME_MANAGE",
    COMMAND_AUTOSTART: "PERMISSION_GAME_MANAGE",
    COMMAND_BQUEUE: "PERMISSION_GAME_MANAGE",
    COMMAND_CHECK: "PERMISSION_GAME_MANAGE",
    COMMAND_CLEARHCL: "PERMISSION_GAME_MANAGE",
    COMMAND_CLOSE: "PERMISSION_GAME_MANAGE",
    COMMAND_CLOSEALL: "PERMISSION_GAME_MANAGE",
    COMMAND_COMP: "PERMISSION_GAME_MANAGE",
    COMMAND_COMPCOLOUR: "PERMISSION_GAME_MANAGE",
    COMMAND_COMPHANDICAP: "PERMISSION_GAME_MANAGE",
    COMMAND_COMPRACE: "PERMISSION_GAME_MANAGE",
    COMMAND_COMPTEAM: "PERMISSION_GAME_MANAGE",
    COMMAND_DISABLERECORDSTATS: "PERMISSION_GAME_MANAGE",
    COMMAND_DOWNLOAD: "PERMISSION_GAME_MANAGE",
    COMMAND_EXCLAMATION: "PERMISSION_GAME_MANAGE",
    COMMAND_FAKELEAVE: "PERMISSION_GAME_MANAGE",
    COMMAND_FAKEPLAYER: "PERMISSION_GAME_MANAGE",
    COMMAND_FPPAUSE: "PERMISSION_GAME_MANAGE",
    COMMAND_FPRESUME: "PERMISSION_GAME_MANAGE",
    COMMAND_FPTRANSFER: "PERMISSION_GAME_MANAGE",
    COMMAND_FROM: "PERMISSION_GAME_MANAGE",
    COMMAND_GAMECONFIG: "PERMISSION_GAME_MANAGE",
    COMMAND_HCL: "PERMISSION_GAME_MANAGE",
    COMMAND_LATENCY: "PERMISSION_GAME_MANAGE",
    COMMAND_MUTEALL: "PERMISSION_GAME_MANAGE",
    COMMAND_OPEN: "PERMISSION_GAME_MANAGE",
    COMMAND_OPENALL: "PERMISSION_GAME_MANAGE",
    COMMAND_PAUSE: "PERMISSION_GAME_MANAGE",
    COMMAND_PING: "PERMISSION_GAME_MANAGE",
    COMMAND_PPAUSE: "PERMISSION_GAME_MANAGE",
    COMMAND_PUB: "PERMISSION_GAME_MANAGE",
    COMMAND_SDUMP: "PERMISSION_GAME_MANAGE",
    COMMAND_SENDLAN: "PERMISSION_GAME_MANAGE",
    COMMAND_START: "PERMISSION_GAME_MANAGE",
    COMMAND_SYNCLIMIT: "PERMISSION_GAME_MANAGE",
    COMMAND_UNHOST: "PERMISSION_GAME_MANAGE",
    COMMAND_UNMUTEALL: "PERMISSION_GAME_MANAGE",
    COMMAND_UNPAUSE: "PERMISSION_GAME_MANAGE",
    COMMAND_VOTECANCEL: "PERMISSION_GAME_MANAGE",
    COMMAND_WATCHENABLED: "PERMISSION_GAME_MANAGE",
    COMMAND_WATCHMODE: "PERMISSION_GAME_MANAGE",

    // PERMISSION_PLAYER_LIST_MANAGE
    COMMAND_BS: "PERMISSION_PLAYER_LIST_MANAGE",
    COMMAND_DENY: "PERMISSION_PLAYER_LIST_MANAGE",
    COMMAND_DENYFLUSH: "PERMISSION_PLAYER_LIST_MANAGE",
    COMMAND_DROP: "PERMISSION_PLAYER_LIST_MANAGE",
    COMMAND_END: "PERMISSION_PLAYER_LIST_MANAGE",
    COMMAND_HOLD: "PERMISSION_PLAYER_LIST_MANAGE",
    COMMAND_KICK: "PERMISSION_PLAYER_LIST_MANAGE",
    COMMAND_MUTE: "PERMISSION_PLAYER_LIST_MANAGE",
    COMMAND_SP: "PERMISSION_PLAYER_LIST_MANAGE",
    COMMAND_SWAP: "PERMISSION_PLAYER_LIST_MANAGE",
    COMMAND_UNMUTE: "PERMISSION_PLAYER_LIST_MANAGE",

    // PERMISSION_BAN_LIST_INSERT
    COMMAND_ADDBAN: "PERMISSION_BAN_LIST_INSERT",
    COMMAND_BANLAST: "PERMISSION_BAN_LIST_INSERT",
    COMMAND_IPBAN: "PERMISSION_BAN_LIST_INSERT",

    // PERMISSION_BAN_LIST_MANAGE
    COMMAND_DELBAN: "PERMISSION_BAN_LIST_MANAGE",
};

// Команды с альтернативным правом (game_commands.md: «X или Y»), где оба права —
// реальные группы админ-листа. Такие команды показываем в каждой из этих групп.
// (Альтернативы вида GAME_LIST_INSERT / GAME_LIMITED_ADMIN не входят в роли
// админ-листа, поэтому для них вторая группа не создаётся.)
const COMMAND_EXTRA_PERMISSIONS: Record<string, string[]> = {
    COMMAND_CHECK: ["PERMISSION_PLAYER_LIST_MANAGE"],
    COMMAND_DOWNLOAD: ["PERMISSION_PLAYER_LIST_MANAGE"],
    COMMAND_FROM: ["PERMISSION_PLAYER_LIST_MANAGE"],
    COMMAND_PING: ["PERMISSION_PLAYER_LIST_MANAGE"],
    COMMAND_SENDLAN: ["PERMISSION_PLAYER_LIST_MANAGE"],
    COMMAND_VOTECANCEL: ["PERMISSION_PLAYER_LIST_MANAGE"],
};

export const OTHER_GROUP_KEY = "__other__";

export const isPermissionRole = (roleName: string) => roleName.startsWith("PERMISSION_");
export const isCommandRole = (roleName: string) => roleName.startsWith("COMMAND_");

// Цепочка иерархии, в которую входит роль, либо null.
export function getRoleHierarchy(roleName: string): readonly string[] | null {
    return ROLE_HIERARCHIES.find((chain) => chain.includes(roleName)) ?? null;
}

// Управляющее право команды (из словаря) либо null для неизвестных.
export function getCommandPermission(roleName: string): string | null {
    return COMMAND_PERMISSION[roleName] ?? null;
}

// Все управляющие права команды (основное + альтернативные). Команда, относящаяся
// к двум правам, попадёт в обе группы.
export function getCommandPermissions(roleName: string): string[] {
    const primary = COMMAND_PERMISSION[roleName];

    if (!primary) return [];

    return [primary, ...(COMMAND_EXTRA_PERMISSIONS[roleName] ?? [])];
}

// «Выдано» с точки зрения каскада: учитывает MAX-режим (true) и SET/числовые значения.
const isGrantedValue = (value: boolean | number | null): boolean =>
    value === true || (typeof value === "number" && value > 0);

// Каскад иерархии прав: возвращает обновлённую карту черновиков, чтобы цепочка
// оставалась согласованной после изменения роли roleName на nextDraft.
//  - выдали роль  → все младшие роли цепочки тоже выдаются (с тем же сроком);
//  - сняли/сбросили/запретили → все старшие роли получают то же значение
//    (нельзя иметь старшее право без младшего).
// Меняются только роли, реально присутствующие в списке (presentRoleNames).
export function cascadeHierarchyDrafts(
    currentDrafts: Record<string, RoleDraft>,
    roleName: string,
    nextDraft: RoleDraft,
    presentRoleNames: ReadonlySet<string>
): Record<string, RoleDraft> {
    const chain = getRoleHierarchy(roleName);

    if (!chain) {
        return { ...currentDrafts, [roleName]: nextDraft };
    }

    const index = chain.indexOf(roleName);
    const nextDrafts: Record<string, RoleDraft> = { ...currentDrafts, [roleName]: nextDraft };

    if (isGrantedValue(nextDraft.value)) {
        // вниз по цепочке: младшие роли выдаём тем же значением и сроком
        for (let i = 0; i < index; i++) {
            const lower = chain[i];

            if (!presentRoleNames.has(lower)) continue;

            nextDrafts[lower] = { value: nextDraft.value, activeBefore: nextDraft.activeBefore };
        }
    } else {
        // вверх по цепочке: старшие роли приводим к тому же (не-выданному) значению
        for (let i = index + 1; i < chain.length; i++) {
            const higher = chain[i];

            if (!presentRoleNames.has(higher)) continue;

            nextDrafts[higher] = {
                value: nextDraft.value,
                activeBefore: nextDraft.value === null ? "" : nextDraft.activeBefore,
            };
        }
    }

    return nextDrafts;
}

// Удобный дефолт черновика для роли (совпадает с логикой таблицы).
export function defaultRoleDraft(value: boolean | number | null, activeBefore: number | null): RoleDraft {
    return { value: value ?? null, activeBefore: toDateTimeLocalInputValue(activeBefore) };
}
