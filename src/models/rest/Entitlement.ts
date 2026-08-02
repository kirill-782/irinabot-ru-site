// Платные фичи пользователя (GET /v1/me/entitlements, openApi.yml §Entitlements).
// Instant-поля — epoch millis, как и во всём остальном API проекта.

// Порядок объявления совпадает с бэкендом (ADMIN_LIST = 0, BAN_LIST = 1, ...),
// но полагаться на позиции не нужно — ответ уже приходит в этом порядке.
export type FeatureKey =
    | "ADMIN_LIST"
    | "BAN_LIST"
    | "AUTOHOST"
    | "ADMIN_LIST_EXTEND"
    | "BAN_LIST_EXTEND"
    | "VIP_FEATURE";

export interface EntitlementTimelineStepOutWeb {
    // конец ступени; отсутствует — последняя, бессрочная ступень
    until?: number | null;
    limit: number;
}

export interface EntitlementOutWeb {
    // сервер может добавить фичу, о которой фронт ещё не знает — не сужаем до FeatureKey
    feature: FeatureKey | string;
    active: boolean;
    // суммарный лимит активных сейчас грантов
    limit: number;
    // до какого момента фича непрерывно активна; отсутствует — бессрочно
    effectiveUntil?: number | null;
    // когда фича снова включится, если сейчас неактивна
    resumesAt?: number | null;
    timeline: EntitlementTimelineStepOutWeb[];
}
