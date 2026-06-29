import { ServerUserAuth } from "../models/websocket/ServerUserAuth";
import type { GetLanguageStaring } from "../hooks/useLanguage";
import type { LanguageRepositoryKeys } from "../localization/Lang";

export type NormalizedValueChangeType = "MAX" | "SET";

// Маркер выбора «все пользователи» (wildcard, targetUserId = null) в UI и в URL (?user=*).
export const EVERYONE_TARGET = "*";

// Ключ языкового пакета для роли в общем camelCase-стиле:
// PERMISSION_ADMIN_LIST_VIEW -> adminListRoleTitlePermissionAdminListView / adminListRoleDescPermissionAdminListView.
const roleKeySuffix = (roleName: string) =>
    roleName
        .toLowerCase()
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

export const adminListRoleTitleKey = (roleName: string) => `adminListRoleTitle${roleKeySuffix(roleName)}`;
export const adminListRoleDescriptionKey = (roleName: string) => `adminListRoleDesc${roleKeySuffix(roleName)}`;

// Триггер команды по имени роли (COMMAND_KICK -> !kick). Несколько команд имеют
// триггер, не совпадающий с именем роли.
const COMMAND_TRIGGER_OVERRIDES: Record<string, string> = {
    COMMAND_EXCLAMATION: "!!",
};

const commandTrigger = (roleName: string) =>
    COMMAND_TRIGGER_OVERRIDES[roleName] ?? "!" + roleName.replace(/^COMMAND_/, "").toLowerCase();

export function resolveAdminListRoleTitle(roleName: string, getString: GetLanguageStaring): string {
    // У команд заголовок генерируется как «Команда <триггер>», в языковом пакете не хранится.
    if (roleName.startsWith("COMMAND_")) {
        const trigger = commandTrigger(roleName);

        return (
            getString("adminListRoleCommandTitle" as LanguageRepositoryKeys, { command: trigger }) ||
            `Команда ${trigger}`
        );
    }

    return getString(adminListRoleTitleKey(roleName) as LanguageRepositoryKeys) || roleName;
}

export function resolveAdminListRoleDescription(roleName: string, getString: GetLanguageStaring): string {
    return getString(adminListRoleDescriptionKey(roleName) as LanguageRepositoryKeys) || "";
}

const normalizeIdentifier = (value?: string | null | number) => {
    if(typeof(value) === "number")
        return value.toString();

    return (value || "").trim().toLocaleLowerCase();
};

const normalizeTimestampToMs = (value: number) => {
    return Math.abs(value) > 1_000_000_000_000 ? value : value * 1000;
};

export function normalizeAdminListValueChangeType(value?: number | string | null): NormalizedValueChangeType {
    if (typeof value === "string") {
        return value.toLocaleUpperCase() === "SET" ? "SET" : "MAX";
    }

    return value === 1 ? "SET" : "MAX";
}

export function parseAdminListDateValue(value?: string | number | null) {
    if (value === null || value === undefined || value === "") return null;

    const date = typeof value === "number" ? new Date(normalizeTimestampToMs(value)) : new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date;
}

export function formatAdminListDateValue(value?: string | number | null, fallback = "Без срока") {
    const parsed = parseAdminListDateValue(value);

    if (!parsed) return fallback;

    return parsed.toLocaleString();
}

export function toDateTimeLocalInputValue(value?: string | number | null) {
    const parsed = parseAdminListDateValue(value);

    if (!parsed) return "";

    const year = parsed.getFullYear();
    const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
    const day = `${parsed.getDate()}`.padStart(2, "0");
    const hours = `${parsed.getHours()}`.padStart(2, "0");
    const minutes = `${parsed.getMinutes()}`.padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function fromDateTimeLocalInputValue(value?: string | null): number | null {
    if (!value || !value.trim()) return null;

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return null;

    return parsed.getTime();
}

export function isCurrentUserIdentifier(currentAuth?: ServerUserAuth | null, value?: string | null) {
    if (!currentAuth) return false;

    const comparableValue = normalizeIdentifier(value);
    const currentUserId = normalizeIdentifier(currentAuth.connectorId);

    if (!comparableValue || !currentUserId) return false;

    return currentUserId === comparableValue;
}

export function isCurrentUserOwner(currentAuth?: ServerUserAuth | null, owner?: string | null) {
    return isCurrentUserIdentifier(currentAuth, owner);
}
