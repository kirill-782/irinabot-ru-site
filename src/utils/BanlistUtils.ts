import { GetLanguageStaring } from "../hooks/useLanguage";
import { LanguageRepositoryKeys } from "../localization/Lang";
import {
    BanlistAction,
    BanlistEntryOutWeb,
    BanlistGraduationLevel,
    BanlistSubjectOutWeb,
    BanlistViolationTemplateOutWeb,
} from "../models/rest/Banlist";

const BANLIST_ACTION_LONG_LABEL_KEY: Record<BanlistAction, LanguageRepositoryKeys> = {
    NONE: "banlistActionNone",
    WARNING: "banlistActionWarning",
    CHAT_RESTRICTION: "banlistActionChatRestriction",
    ENTER_GAME_RESTRICTION: "banlistActionEnterGameRestriction",
};

// действия для ручной записи бана (NONE здесь не имеет смысла — запись ничего не делает)
export const BANLIST_ACTIONS: BanlistAction[] = ["WARNING", "CHAT_RESTRICTION", "ENTER_GAME_RESTRICTION"];

// действия для ступени градации: NONE — «засчитать нарушение, но ничего не выдавать»
export const BANLIST_GRADUATION_ACTIONS: BanlistAction[] = [
    "NONE",
    "WARNING",
    "CHAT_RESTRICTION",
    "ENTER_GAME_RESTRICTION",
];

export function actionLongLabel(t: GetLanguageStaring, action?: BanlistAction | null): string {
    if (!action) return "—";

    const key = BANLIST_ACTION_LONG_LABEL_KEY[action];

    return key ? t(key) : action;
}

export function semanticColorForAction(
    action?: BanlistAction | null
): "yellow" | "orange" | "red" | "grey" {
    switch (action) {
        case "NONE":
            return "grey";
        case "WARNING":
            return "yellow";
        case "CHAT_RESTRICTION":
            return "orange";
        case "ENTER_GAME_RESTRICTION":
            return "red";
        default:
            return "yellow";
    }
}

export function parseBanlistDate(value?: string | number | null): Date | null {
    if (value === null || value === undefined || value === "") return null;

    const date = typeof value === "number" ? new Date(value) : new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date;
}

export function formatBanlistDate(value?: string | number | null, fallback = "—"): string {
    const parsed = parseBanlistDate(value);

    if (!parsed) return fallback;

    return parsed.toLocaleString();
}

export function formatBanlistDateShort(value?: string | number | null, fallback = "—"): string {
    const parsed = parseBanlistDate(value);

    if (!parsed) return fallback;

    return parsed.toLocaleDateString();
}

export function formatRelative(t: GetLanguageStaring, value?: string | number | null): string {
    const parsed = parseBanlistDate(value);

    if (!parsed) return "—";

    const diff = Date.now() - parsed.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return t("banlistRelativeJustNow");
    if (diff < hour) return t("banlistRelativeMinutesAgo", { count: Math.floor(diff / minute) });
    if (diff < day) return t("banlistRelativeHoursAgo", { count: Math.floor(diff / hour) });
    if (diff < 7 * day) return t("banlistRelativeDaysAgo", { count: Math.floor(diff / day) });

    return parsed.toLocaleDateString();
}

export function formatDuration(t: GetLanguageStaring, seconds?: number | null): string {
    if (seconds === null || seconds === undefined) return t("banlistDurationForever");
    if (!Number.isFinite(seconds) || seconds <= 0) return "—";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const daysPart = t("banlistDurationDays", { count: days });
    const hoursPart = t("banlistDurationHours", { count: hours });
    const minutesPart = t("banlistDurationMinutes", { count: minutes });

    if (days >= 1) return hours > 0 ? `${daysPart} ${hoursPart}` : daysPart;
    if (hours >= 1) return minutes > 0 ? `${hoursPart} ${minutesPart}` : hoursPart;
    if (minutes >= 1) return minutesPart;

    return t("banlistDurationSeconds", { count: seconds });
}

const ISO_DURATION_RE =
    /^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

export function parseIso8601DurationToSeconds(iso?: string | null): number | null {
    if (!iso) return null;

    const trimmed = iso.trim().toUpperCase();

    if (!trimmed) return null;

    const match = ISO_DURATION_RE.exec(trimmed);

    if (!match) return null;

    const [, dRaw, hRaw, mRaw, sRaw] = match;

    if (!dRaw && !hRaw && !mRaw && !sRaw) return null;

    const d = Number(dRaw || 0);
    const h = Number(hRaw || 0);
    const m = Number(mRaw || 0);
    const s = Number(sRaw || 0);

    return Math.round(d * 86400 + h * 3600 + m * 60 + s);
}

export function formatSecondsToIso8601(seconds?: number | null): string {
    if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) {
        return "";
    }

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    let result = "P";

    if (days > 0) result += `${days}D`;

    if (hours > 0 || minutes > 0 || secs > 0) {
        result += "T";
        if (hours > 0) result += `${hours}H`;
        if (minutes > 0) result += `${minutes}M`;
        if (secs > 0) result += `${secs}S`;
    }

    return result === "P" ? "P0D" : result;
}

export function durationFromTemplateField(
    seconds?: number | null,
    iso?: string | null
): number | null {
    if (seconds !== null && seconds !== undefined) return seconds;

    return parseIso8601DurationToSeconds(iso);
}

export function formatExpire(t: GetLanguageStaring, entry: BanlistEntryOutWeb): string {
    if (entry.expireAt === null || entry.expireAt === undefined) {
        return t("banlistDurationForever");
    }

    const parsed = parseBanlistDate(entry.expireAt);

    if (!parsed) return "—";

    const diff = parsed.getTime() - Date.now();

    if (diff <= 0) return t("banlistExpireExpired");

    return t("banlistExpireUntil", { date: parsed.toLocaleString() });
}

export type BanlistActivationStatus = "immediate" | "pending" | "triggered";

export interface BanlistActivationInfo {
    status: BanlistActivationStatus;
    deferredSeconds: number | null;
    triggeredAt: number | null;
}

export function getActivationInfo(entry: BanlistEntryOutWeb): BanlistActivationInfo {
    const deferredSeconds = durationFromTemplateField(
        entry.deferredDurationSeconds,
        entry.deferredDuration
    );

    if (!deferredSeconds) {
        return { status: "immediate", deferredSeconds: null, triggeredAt: null };
    }

    if (entry.firstTriggeredAt) {
        return {
            status: "triggered",
            deferredSeconds,
            triggeredAt: entry.firstTriggeredAt,
        };
    }

    return { status: "pending", deferredSeconds, triggeredAt: null };
}

export function subjectString(subject?: BanlistSubjectOutWeb | null): string {
    if (!subject) return "—";

    if (subject.matchUserId) return `userId: ${subject.matchUserId}`;
    if (subject.matchPvpgnRealm || subject.matchPvpgnName) {
        const realm = subject.matchPvpgnRealm || "?";
        const name = subject.matchPvpgnName || "?";
        return `${realm} / ${name}`;
    }
    if (subject.matchIpCidr) return `ip: ${subject.matchIpCidr}`;
    if (subject.matchHardwareId) return `hwid: ${subject.matchHardwareId}`;

    return "—";
}

export function sortGraduation(graduation: BanlistGraduationLevel[]): BanlistGraduationLevel[] {
    return [...graduation].sort((a, b) => (a.minCount || 0) - (b.minCount || 0));
}

/** Валидный индекс уровня по умолчанию. Бекэнд поле не проверяет, поэтому
 *  отсутствующее значение и выход за границы graduation трактуются как null. */
export function getDefaultGraduationIndex(template: BanlistViolationTemplateOutWeb): number | null {
    const graduation = template.graduation || [];
    const index = template.defaultGraduationIndex;

    if (index === null || index === undefined) return null;
    if (!Number.isInteger(index) || index < 0 || index >= graduation.length) return null;

    return index;
}

export function getDefaultGraduationLevel(
    template: BanlistViolationTemplateOutWeb
): BanlistGraduationLevel | null {
    const index = getDefaultGraduationIndex(template);

    if (index === null) return null;

    return (template.graduation || [])[index];
}

export function templateResetSeconds(template: BanlistViolationTemplateOutWeb): number | null {
    return durationFromTemplateField(
        template.graduationResetAfterSeconds,
        template.graduationResetAfter
    );
}

// остывание нарушений: по времени и/или по завершённым играм, с общим шагом снятия.
export function describeReset(t: GetLanguageStaring, template: BanlistViolationTemplateOutWeb): string {
    const seconds = templateResetSeconds(template);
    const games = template.graduationResetAfterCompletedGames;
    const hasTime = seconds !== null && seconds > 0;
    const hasGames = !!games && games > 0;

    if (!hasTime && !hasGames) return t("banlistResetNever");

    const parts: string[] = [];
    if (hasTime) parts.push(formatDuration(t, seconds as number));
    if (hasGames) parts.push(t("banlistResetGamesUnit", { count: games }));
    const trigger = parts.join(" / ");

    const step = template.graduationResetStepCount;

    // step задан — снимаем фиксированное число; null — полный сброс счётчика за шаг
    return step && step > 0
        ? t("banlistResetStep", { count: step, trigger })
        : t("banlistResetFull", { trigger });
}
