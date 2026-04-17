import type { AuthData } from "../../context";

export interface AccessControlledRoute {
    requiredAccessMask?: number;
    requiredAuthorities?: string[];
    requireAuth?: boolean;
    requireToken?: boolean;
}

export interface AdminSection extends AccessControlledRoute {
    key: string;
    title: string;
    path: string;
}

export const adminSections: AdminSection[] = [
    {
        key: "autoupdater",
        title: "Автоапдейтер",
        path: "autoupdater",
        requireAuth: true,
        requireToken: true,
        requiredAuthorities: ["UPDATES_PUBLISH"],
    },
    {
        key: "admin-list-app-admin",
        title: "Admin list (администратор)",
        path: "admin-list-app-admin",
        requireAuth: true,
        requireToken: true,
        requiredAuthorities: ["ADMINLIST_ADMIN"],
    },
];

export function canAccessControlledRoute(auth: AuthData, route: AccessControlledRoute) {
    if (route.requireToken && !auth.apiToken.hasToken()) return false;

    if (route.requiredAccessMask && !auth.accessMask.hasAccess(route.requiredAccessMask)) return false;

    if (route.requiredAuthorities?.some((authority) => !auth.apiToken.hasAuthority(authority))) return false;

    if (route.requireAuth && !auth.currentAuth) return false;

    return true;
}

export function getAccessibleAdminSections(auth: AuthData) {
    return adminSections.filter((section) => {
        return canAccessControlledRoute(auth, section);
    });
}
