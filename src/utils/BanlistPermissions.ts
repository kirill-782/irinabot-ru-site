import { GetLanguageStaring } from "../hooks/useLanguage";
import { LanguageRepositoryKeys } from "../localization/Lang";
import { BanlistOutWeb, BanlistPermissionsOutWeb } from "../models/rest/Banlist";
import { ServerUserAuth } from "../models/websocket/ServerUserAuth";
import { isCurrentUserOwner } from "./AdminListUtils";

// Производные права для UI. Отражают ролевую модель админ-листа:
//   view             — базовый доступ (чтение): списки, проверка субъекта
//   violationsTrack  — выдавать нарушения по шаблонам и инкременты (увеличивать счётчики)
//   insert           — прямое добавление/правка/удаление записей, правка статистики и субъектов
//   manageTemplates  — создавать/редактировать/удалять шаблоны нарушений
//   manageBanlist    — управлять самой сущностью банлиста (настройки/удаление); только владелец
export interface BanlistCapabilities {
    canView: boolean;
    canTrackViolations: boolean;
    canInsert: boolean;
    canManageTemplates: boolean;
    canManageBanlist: boolean;
}

// Уровень доступа от старшего к младшему — для бейджа/легенды.
export type BanlistAccessLevel = "manage" | "insert" | "violationsTrack" | "view" | "none";

const ACCESS_LEVEL_LABEL_KEY: Record<BanlistAccessLevel, LanguageRepositoryKeys> = {
    manage: "banlistAccessManage",
    insert: "banlistAccessInsert",
    violationsTrack: "banlistAccessViolations",
    view: "banlistAccessView",
    none: "banlistAccessNone",
};

// Бэкенд отдаёт права кумулятивно, но на всякий случай досчитываем вложенность
// (manage ⇒ insert ⇒ violationsTrack ⇒ view), чтобы UI не зависел от формы ответа.
export function resolveBanlistCapabilities(
    banlist?: BanlistOutWeb | null,
    currentAuth?: ServerUserAuth | null
): BanlistCapabilities {
    const permissions: BanlistPermissionsOutWeb | undefined = banlist?.permissions;

    // Владельца определяем по тому же принципу, что и в админ-листах. Если текущий
    // пользователь ещё не известен (например, REST-доступ без websocket-авторизации),
    // не прячем управление — бэкенд всё равно проверит права.
    const ownerKnown = !!currentAuth;
    const isOwner = !ownerKnown || isCurrentUserOwner(currentAuth, banlist?.ownerUserId);

    // Обратная совместимость: старый бэкенд не присылает permissions — считаем доступ полным.
    if (!permissions) {
        return {
            canView: true,
            canTrackViolations: true,
            canInsert: true,
            canManageTemplates: true,
            canManageBanlist: isOwner,
        };
    }

    const manage = !!permissions.manage;
    const insert = manage || !!permissions.insert;
    const violationsTrack = insert || !!permissions.violationsTrack;
    const view = violationsTrack || !!permissions.view;

    return {
        canView: view,
        canTrackViolations: violationsTrack,
        canInsert: insert,
        canManageTemplates: manage,
        // Управление сущностью банлиста — только владелец с базовым доступом.
        canManageBanlist: view && isOwner,
    };
}

export function banlistAccessLevel(capabilities: BanlistCapabilities): BanlistAccessLevel {
    if (capabilities.canManageTemplates) return "manage";
    if (capabilities.canInsert) return "insert";
    if (capabilities.canTrackViolations) return "violationsTrack";
    if (capabilities.canView) return "view";
    return "none";
}

export function banlistAccessLevelLabel(
    t: GetLanguageStaring,
    capabilities: BanlistCapabilities
): string {
    return t(ACCESS_LEVEL_LABEL_KEY[banlistAccessLevel(capabilities)]);
}
