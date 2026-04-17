import { ServerUserAuth } from "../models/websocket/ServerUserAuth";

export type NormalizedValueChangeType = "MAX" | "SET";

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

export function fromDateTimeLocalInputValue(value?: string | null) {
    if (!value || !value.trim()) return null;

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return null;

    return parsed.toISOString();
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
