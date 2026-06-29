import { GetLanguageStaring } from "../hooks/useLanguage";
import {
    BanlistGraduationLevel,
    BanlistAction,
    BanlistViolationTemplateInWeb,
    BanlistViolationTemplateOutWeb,
} from "../models/rest/Banlist";
import {
    actionLongLabel,
    BANLIST_GRADUATION_ACTIONS,
    durationFromTemplateField,
    formatSecondsToIso8601,
    getDefaultGraduationIndex,
    parseIso8601DurationToSeconds,
    sortGraduation,
} from "./BanlistUtils";

export type DurationUnit = "minutes" | "hours" | "days" | "iso" | "forever" | "none";

export interface GraduationDraft {
    minCount: string;
    action: BanlistAction;
    durationValue: string;
    durationUnit: DurationUnit;
    deferredValue: string;
    deferredUnit: DurationUnit;
}

export interface TemplateDraftState {
    name: string;
    tag: string;
    reason: string;
    grads: GraduationDraft[];
    defaultGradIndex: number | null;
    // остывание по времени неактивности (graduationResetAfterSeconds)
    timeResetEnabled: boolean;
    resetValue: string;
    resetUnit: DurationUnit;
    // остывание по завершённым играм (graduationResetAfterCompletedGames)
    gamesResetEnabled: boolean;
    gamesResetCount: string;
    // общий шаг снятия нарушений за один интервал остывания (graduationResetStepCount)
    resetStepCount: string;
}

export type TemplateDraftPayloadResult =
    | { payload: BanlistViolationTemplateInWeb; error: null }
    | { payload: null; error: string };

export type DurationUnitOption = { key: DurationUnit; value: DurationUnit; text: string };

export const buildActionOptions = (t: GetLanguageStaring) =>
    BANLIST_GRADUATION_ACTIONS.map((action) => ({
        key: action,
        value: action,
        text: actionLongLabel(t, action),
    }));

export const buildUnitOptions = (t: GetLanguageStaring): DurationUnitOption[] => [
    { key: "forever", value: "forever", text: t("banlistDurationForever") },
    { key: "minutes", value: "minutes", text: t("banlistUnitMinShort") },
    { key: "hours", value: "hours", text: t("banlistUnitHours") },
    { key: "days", value: "days", text: t("banlistUnitDays") },
    { key: "iso", value: "iso", text: "ISO 8601" },
];

export const buildDeferredUnitOptions = (t: GetLanguageStaring): DurationUnitOption[] => [
    { key: "none", value: "none", text: t("banlistTemplateEditorNoDeferred") },
    { key: "minutes", value: "minutes", text: t("banlistUnitMinShort") },
    { key: "hours", value: "hours", text: t("banlistUnitHours") },
    { key: "days", value: "days", text: t("banlistUnitDays") },
    { key: "iso", value: "iso", text: "ISO 8601" },
];

export const buildResetUnitOptions = (t: GetLanguageStaring): DurationUnitOption[] => [
    { key: "days", value: "days", text: t("banlistUnitDays") },
    { key: "hours", value: "hours", text: t("banlistUnitHours") },
    { key: "minutes", value: "minutes", text: t("banlistUnitMinShort") },
    { key: "iso", value: "iso", text: "ISO 8601" },
];

export const secondsToDuration = (
    seconds: number | null | undefined,
    isoFallback?: string | null
): { value: string; unit: DurationUnit } => {
    if ((seconds === null || seconds === undefined) && isoFallback) {
        return { value: isoFallback, unit: "iso" };
    }
    if (seconds === null || seconds === undefined) {
        return { value: "", unit: "forever" };
    }
    if (seconds % 86400 === 0) return { value: String(seconds / 86400), unit: "days" };
    if (seconds % 3600 === 0) return { value: String(seconds / 3600), unit: "hours" };
    if (seconds % 60 === 0) return { value: String(seconds / 60), unit: "minutes" };
    return { value: formatSecondsToIso8601(seconds), unit: "iso" };
};

export const buildDurationPayload = (
    rawValue: string,
    unit: DurationUnit
): { seconds: number | null; iso: string | null } => {
    if (unit === "forever" || unit === "none") return { seconds: null, iso: null };

    if (unit === "iso") {
        const trimmed = rawValue.trim();
        if (!trimmed) return { seconds: null, iso: null };
        const parsed = parseIso8601DurationToSeconds(trimmed);
        if (parsed === null || parsed <= 0) return { seconds: null, iso: null };
        // Бекэнд понимает только секунды (ISO-поля он молча отбрасывает),
        // поэтому ISO — лишь формат ввода, наружу всегда уходят секунды.
        return { seconds: parsed, iso: null };
    }

    const numeric = Number(rawValue);
    if (!Number.isFinite(numeric) || numeric <= 0) return { seconds: null, iso: null };

    switch (unit) {
        case "minutes":
            return { seconds: numeric * 60, iso: null };
        case "hours":
            return { seconds: numeric * 3600, iso: null };
        case "days":
            return { seconds: numeric * 86400, iso: null };
        default:
            return { seconds: null, iso: null };
    }
};

export const buildInitialGrads = (
    template?: BanlistViolationTemplateOutWeb | null
): GraduationDraft[] => {
    const source = sortGraduation(template?.graduation || []);
    if (source.length === 0) {
        return [
            {
                minCount: "1",
                action: "WARNING",
                durationValue: "",
                durationUnit: "forever",
                deferredValue: "",
                deferredUnit: "none",
            },
        ];
    }
    return source.map((level) => {
        const duration = secondsToDuration(level.expireDurationSeconds, level.expireDuration);
        const deferredSeconds = durationFromTemplateField(
            level.deferredDurationSeconds,
            level.deferredDuration
        );
        const deferredEnabled = deferredSeconds !== null;
        const deferred = deferredEnabled
            ? secondsToDuration(level.deferredDurationSeconds, level.deferredDuration)
            : { value: "", unit: "none" as DurationUnit };
        return {
            minCount: String(level.minCount),
            action: level.action,
            durationValue: duration.value,
            durationUnit: duration.unit,
            deferredValue: deferred.value,
            deferredUnit: deferred.unit === "forever" ? "none" : deferred.unit,
        };
    });
};

// индекс с сервера указывает в исходный массив graduation; редактор работает
// с отсортированной копией, поэтому переносим индекс через ссылку на уровень
export const buildInitialDefaultIndex = (
    template?: BanlistViolationTemplateOutWeb | null
): number | null => {
    if (!template) return null;

    const source = template.graduation || [];
    const validIndex = getDefaultGraduationIndex(template);

    if (validIndex === null) return null;

    return sortGraduation(source).indexOf(source[validIndex]);
};

export const buildInitialTimeResetEnabled = (
    template?: BanlistViolationTemplateOutWeb | null
): boolean =>
    durationFromTemplateField(
        template?.graduationResetAfterSeconds,
        template?.graduationResetAfter
    ) !== null;

export const buildInitialGamesResetEnabled = (
    template?: BanlistViolationTemplateOutWeb | null
): boolean => !!template?.graduationResetAfterCompletedGames &&
    template.graduationResetAfterCompletedGames > 0;

export const buildInitialReset = (
    template?: BanlistViolationTemplateOutWeb | null
): { value: string; unit: DurationUnit } => {
    const seconds = durationFromTemplateField(
        template?.graduationResetAfterSeconds,
        template?.graduationResetAfter
    );
    if (seconds === null) return { value: "30", unit: "days" };
    const duration = secondsToDuration(seconds, template?.graduationResetAfter);
    return {
        value: duration.value,
        unit: duration.unit === "forever" ? "days" : duration.unit,
    };
};

export const buildTemplatePayload = (
    t: GetLanguageStaring,
    draft: TemplateDraftState
): TemplateDraftPayloadResult => {
    if (!draft.name.trim()) {
        return { payload: null, error: t("banlistTemplateEditorNameRequired") };
    }

    const graduation: BanlistGraduationLevel[] = [];

    for (const [index, grad] of draft.grads.entries()) {
        const minCount = Number(grad.minCount);
        if (!Number.isFinite(minCount) || minCount < 1) {
            return {
                payload: null,
                error: t("banlistTemplateEditorLevelMinCount", { index: index + 1 }),
            };
        }

        const level: BanlistGraduationLevel = {
            minCount,
            action: grad.action,
            expireDurationSeconds: null,
            expireDuration: null,
            deferredDurationSeconds: null,
            deferredDuration: null,
        };

        // WARNING и NONE ничего не банят — длительность не нужна (бэкенд её игнорирует)
        if (grad.action !== "WARNING" && grad.action !== "NONE") {
            const expire = buildDurationPayload(grad.durationValue, grad.durationUnit);
            if (
                grad.durationUnit !== "forever" &&
                expire.seconds === null &&
                expire.iso === null
            ) {
                return {
                    payload: null,
                    error: t("banlistTemplateEditorLevelDuration", {
                        index: index + 1,
                        iso: grad.durationUnit === "iso" ? " (ISO 8601)" : "",
                    }),
                };
            }
            level.expireDurationSeconds = expire.seconds;
            level.expireDuration = expire.iso;
        }

        if (grad.deferredUnit !== "none") {
            const deferred = buildDurationPayload(grad.deferredValue, grad.deferredUnit);
            if (deferred.seconds === null && deferred.iso === null) {
                return {
                    payload: null,
                    error: t("banlistTemplateEditorLevelDeferred", {
                        index: index + 1,
                        iso: grad.deferredUnit === "iso" ? " (ISO 8601)" : "",
                    }),
                };
            }
            level.deferredDurationSeconds = deferred.seconds;
            level.deferredDuration = deferred.iso;
        }

        graduation.push(level);
    }

    // graduation ниже сортируется — индекс по умолчанию переносим через ссылку
    const defaultLevel =
        draft.defaultGradIndex !== null ? graduation[draft.defaultGradIndex] : null;

    graduation.sort((a, b) => a.minCount - b.minCount);

    const payload: BanlistViolationTemplateInWeb = {
        name: draft.name.trim(),
        reason: draft.reason.trim() || null,
        tag: draft.tag.trim() || null,
        graduation,
        defaultGraduationIndex: defaultLevel ? graduation.indexOf(defaultLevel) : null,
        graduationResetAfterSeconds: null,
        graduationResetAfter: null,
        graduationResetAfterCompletedGames: null,
        graduationResetStepCount: null,
        expireDurationSeconds: null,
    };

    // остывание по времени неактивности
    if (draft.timeResetEnabled) {
        const reset = buildDurationPayload(draft.resetValue, draft.resetUnit);
        if (reset.seconds === null && reset.iso === null) {
            return {
                payload: null,
                error: t("banlistTemplateEditorResetPositive", {
                    iso: draft.resetUnit === "iso" ? " (ISO 8601)" : "",
                }),
            };
        }
        payload.graduationResetAfterSeconds = reset.seconds;
        payload.graduationResetAfter = reset.iso;
    }

    // остывание по завершённым играм
    if (draft.gamesResetEnabled) {
        const games = Number(draft.gamesResetCount);
        if (!Number.isInteger(games) || games <= 0) {
            return { payload: null, error: t("banlistTemplateEditorGamesPositive") };
        }
        payload.graduationResetAfterCompletedGames = games;
    }

    // общий шаг снятия: пусто — полный сброс счётчика за интервал; число — снимать ровно столько.
    // имеет смысл только при включённом остывании.
    if (draft.timeResetEnabled || draft.gamesResetEnabled) {
        const stepRaw = draft.resetStepCount.trim();
        if (stepRaw) {
            const step = Number(stepRaw);
            if (!Number.isInteger(step) || step <= 0) {
                return { payload: null, error: t("banlistTemplateEditorResetStepPositive") };
            }
            payload.graduationResetStepCount = step;
        }
    }

    return { payload, error: null };
};
