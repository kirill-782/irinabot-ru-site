export type BanlistAction =
    | "NONE"
    | "NOTIFY"
    | "WARNING"
    | "CHAT_RESTRICTION"
    | "ENTER_GAME_RESTRICTION";

export interface BanlistGraduationLevel {
    minCount: number;
    action: BanlistAction;
    expireDurationSeconds?: number | null;
    expireDuration?: string | null;
    deferredDurationSeconds?: number | null;
    deferredDuration?: string | null;
}

// Права вызывающего пользователя в этом банлисте (ролевая модель админ-листа).
// Кумулятивно: manage ⇒ insert ⇒ violationsTrack ⇒ view.
export interface BanlistPermissionsOutWeb {
    view?: boolean;
    violationsTrack?: boolean;
    insert?: boolean;
    manage?: boolean;
}

export interface BanlistOutWeb {
    id?: number;
    ownerUserId?: string;
    name?: string;
    description?: string | null;
    adminListInstanceId?: number | null;
    shiftAdminListExpireOnDeferred?: boolean;
    restrictEntryTagsToTemplates?: boolean;
    // минимальный интервал в секундах между нарушениями одного субъекта по одному
    // шаблону; null/0 — защита выключена
    sameTemplateViolationProtectionSeconds?: number | null;
    createdAt?: number;
    updatedAt?: number;
    permissions?: BanlistPermissionsOutWeb;
}

export interface BanlistInWeb {
    name: string;
    description?: string | null;
    adminListInstanceId?: number | null;
    shiftAdminListExpireOnDeferred?: boolean | null;
    restrictEntryTagsToTemplates?: boolean | null;
    sameTemplateViolationProtectionSeconds?: number | null;
}

export interface BanlistPatchInWeb {
    name?: string | null;
    description?: string | null;
    adminListInstanceId?: number | null;
    shiftAdminListExpireOnDeferred?: boolean | null;
    restrictEntryTagsToTemplates?: boolean | null;
    sameTemplateViolationProtectionSeconds?: number | null;
}

export interface BanlistViolationTemplateOutWeb {
    id?: number;
    banlistId?: number;
    name?: string;
    reason?: string | null;
    tag?: string | null;
    graduation?: BanlistGraduationLevel[] | null;
    defaultGraduationIndex?: number | null;
    graduationResetAfterSeconds?: number | null;
    graduationResetAfter?: string | null;
    graduationResetStepCount?: number | null;
    graduationResetAfterCompletedGames?: number | null;
    expireDurationSeconds?: number | null;
    expireDuration?: string | null;
    createdAt?: number;
    updatedAt?: number;
}

export interface BanlistViolationTemplateInWeb {
    name: string;
    reason?: string | null;
    tag?: string | null;
    graduation?: BanlistGraduationLevel[] | null;
    defaultGraduationIndex?: number | null;
    graduationResetAfterSeconds?: number | null;
    graduationResetAfter?: string | null;
    graduationResetStepCount?: number | null;
    graduationResetAfterCompletedGames?: number | null;
    expireDurationSeconds?: number | null;
    expireDuration?: string | null;
}

export interface BanlistSubjectOutWeb {
    id?: number;
    banlistId?: number;
    matchUserId?: string | null;
    matchPvpgnRealm?: string | null;
    matchPvpgnName?: string | null;
    matchIpCidr?: string | null;
    matchHardwareId?: string | null;
    createdAt?: number;
    updatedAt?: number;
}

export interface BanlistSubjectInWeb {
    matchUserId?: string | null;
    matchPvpgnRealm?: string | null;
    matchPvpgnName?: string | null;
    matchIpCidr?: string | null;
    matchHardwareId?: string | null;
}

export interface BanlistSubjectPatchInWeb {
    matchIpCidr?: string | null;
    matchHardwareId?: string | null;
}

export interface BanlistEntryOutWeb {
    id?: number;
    banlistId?: number;
    subject?: BanlistSubjectOutWeb;
    templateId?: number | null;
    enabled?: boolean;
    // учитывать IP/CIDR субъекта при матчинге этой записи в /check
    matchByIpCidr?: boolean;
    // учитывать HWID субъекта при матчинге этой записи в /check
    matchByHardwareId?: boolean;
    action?: BanlistAction;
    reason?: string | null;
    tag?: string | null;
    // userId выдавшего бан (напрямую или через систему учёта нарушений); null — неизвестен
    issuedByUserId?: string | null;
    // бан выдан из-под технической УЗ (сервисный токен/бот), а не пользователем напрямую
    issuedByTechnicalAccount?: boolean;
    // произвольные свойства технической УЗ; опускаются в ответе, если пусто
    technicalProperties?: Record<string, string> | null;
    expireAt?: number | null;
    deferredDurationSeconds?: number | null;
    deferredDuration?: string | null;
    firstTriggeredAt?: number | null;
    createdAt?: number;
    updatedAt?: number;
}

export type BanlistEntryStatus = "active" | "expired" | "deferred";

// query-параметры GET /v1/banlists/{id}/entries — серверная фильтрация и пагинация
export interface BanlistEntriesQueryParams {
    action?: BanlistAction;
    status?: BanlistEntryStatus;
    templateId?: number;
    hasTemplate?: boolean;
    tag?: string;
    // поиск субъекта: точное совпадение userId, иначе ник через LIKE без учёта регистра
    query?: string;
    offset?: number;
    count?: number;
}

// тело + общее число записей из заголовка X-Total-Count
export interface BanlistEntriesPage {
    entries: BanlistEntryOutWeb[];
    total: number;
}

export interface BanlistEntryInWeb {
    subject: BanlistSubjectInWeb;
    action: BanlistAction;
    reason?: string | null;
    tag?: string | null;
    expireAt?: number | null;
    deferredDurationSeconds?: number | null;
    deferredDuration?: string | null;
    // учитывать IP/CIDR субъекта при матчинге записи в /check; по умолчанию false
    matchByIpCidr?: boolean;
    // учитывать HWID субъекта при матчинге записи в /check; по умолчанию false
    matchByHardwareId?: boolean;
    // свойства технической УЗ — сохраняются только при выдаче из-под бот-токена; у TYPE_USER игнорируются
    technicalProperties?: Record<string, string> | null;
}

export interface BanlistEntryPutInWeb {
    enabled: boolean;
    action: BanlistAction;
    reason?: string | null;
    tag?: string | null;
    expireAt?: number | null;
    deferredDurationSeconds?: number | null;
    // учитывать IP/CIDR субъекта при матчинге записи; полная замена — null/отсутствие = false
    matchByIpCidr?: boolean | null;
    // учитывать HWID субъекта при матчинге записи; полная замена — null/отсутствие = false
    matchByHardwareId?: boolean | null;
    // true — переписать выдавшего на текущего инициатора; иначе/отсутствует — не меняется
    replaceIssuer?: boolean | null;
}

export interface BanlistEntryPatchInWeb {
    enabled?: boolean | null;
    action?: BanlistAction | null;
    reason?: string | null;
    // учитывать IP/CIDR субъекта при матчинге записи; null/отсутствие — не менять
    matchByIpCidr?: boolean | null;
    // учитывать HWID субъекта при матчинге записи; null/отсутствие — не менять
    matchByHardwareId?: boolean | null;
    // true — переписать выдавшего на текущего инициатора; иначе/отсутствует — не трогать
    replaceIssuer?: boolean | null;
}

export interface BanlistCheckRequestInWeb {
    userId?: string | null;
    pvpgnRealm?: string | null;
    pvpgnName?: string | null;
    ip?: string | null;
    hardwareId?: string | null;
}

// вычисляемые поля бана, эксклюзивные для ответа /check
export interface BanlistCheckComputedOutWeb {
    // реальная дата начала действия (UNIX, мс): firstTriggeredAt либо createdAt; никогда не null
    effectiveStartAt?: number;
    // реальная дата истечения (UNIX, мс): expireAt запущенного бана. null/опущено — бессрочно ИЛИ
    // отложенный ещё не запущен (различать по pendingDeferred)
    effectiveExpireAt?: number | null;
    // отложенный бан, ещё не активированный первым входом (firstTriggeredAt == null)
    pendingDeferred?: boolean;
    // отложенный бан был активирован недавно — не более минуты назад
    recentlyActivated?: boolean;
}

// запись бана в ответе /check: все поля BanlistEntryOutWeb плюс под-объект computed
export interface BanlistCheckEntryOutWeb extends BanlistEntryOutWeb {
    computed?: BanlistCheckComputedOutWeb;
}

export interface BanlistCheckResultOutWeb {
    restrictions?: BanlistCheckEntryOutWeb[];
}

export interface BanlistIncrementRequestInWeb {
    subject: BanlistSubjectInWeb;
    // свойства, которые техническая УЗ пишет в создаваемую/эскалируемую запись бана (только бот-токен)
    technicalProperties?: Record<string, string> | null;
}

export interface BanlistIncrementResultOutWeb {
    violationCount?: number;
    // violationCount на момент последнего срабатывания ступени градации
    lastGraduatedCount?: number;
    action?: BanlistAction | null;
    // true — нарушение НЕ засчитано из-за защиты от однотипных нарушений банлиста:
    // счётчики и action неизменны, новая запись бана не создаётся
    suppressed?: boolean;
    createdEntry?: BanlistEntryOutWeb | null;
}

export interface BanlistViolationStatsOutWeb {
    id?: number;
    templateId?: number;
    subject?: BanlistSubjectOutWeb;
    violationCount?: number;
    // violationCount на момент последнего срабатывания ступени градации
    lastGraduatedCount?: number;
    // завершённые игры с последнего нарушения (топливо остывания по играм)
    completedGamesCount?: number;
    lastTriggeredAt?: number;
    graduationResetAt?: number | null;
    createdAt?: number;
    updatedAt?: number;
}

// тело PATCH .../stats/{statsId} — ручная правка счётчиков. Tri-state: пропущенное/null поле не меняется
export interface BanlistViolationStatsPatchInWeb {
    violationCount?: number | null;
    lastGraduatedCount?: number | null;
    completedGamesCount?: number | null;
}

// query-параметры GET .../stats — серверный поиск + оффсетная пагинация
export interface BanlistViolationStatsQueryParams {
    // поиск субъекта: точное совпадение userId, иначе ник через LIKE без учёта регистра
    query?: string;
    offset?: number;
    count?: number;
}

// тело + общее число записей из заголовка X-Total-Count
export interface BanlistViolationStatsPage {
    stats: BanlistViolationStatsOutWeb[];
    total: number;
}
