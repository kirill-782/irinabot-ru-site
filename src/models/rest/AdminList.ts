export type ValueChangeType = "MAX" | "SET";

export interface AdminListOutWebRole {
    name?: string;
    declared?: boolean;
    owned?: boolean;
}

export interface AdminListBase {
    owner?: string;
    default?: boolean;
    comment?: string | null;
    activeBefore?: number | null;
    itemsActiveBefore?: number | null;
}

export interface AdminListExtended {
    valueChangeType?: number;
}

export interface AdminListSummaryOutWeb extends AdminListBase {
    id?: number;
}

export interface AdminListFullOutWeb extends AdminListBase, AdminListExtended {
    id?: number;
    roles?: AdminListOutWebRole[];
    privilegeLevel?: number | null;
}

export type AdminListOutWeb = AdminListFullOutWeb;

// Ответ POST /v1/admin-lists: id + Base + Extended (без roles/privilegeLevel).
export interface AdminListCreatedOutWeb extends AdminListBase, AdminListExtended {
    id?: number;
}

export interface AdminListPatchInWeb {
    comment?: string | null;
    valueChangeType?: ValueChangeType;
}

export interface AdminListUserListOutWeb {
    userId?: string;
    declarationCount?: number;
}

export interface AdminListUserOutWebRole {
    name?: string;
    value?: boolean | number | null;
    grantedBy?: string | null;
    activeBefore?: number | null;
}

export interface AdminListUserOutWeb {
    roles?: AdminListUserOutWebRole[];
    privilegeLevel?: number | null;
}

export interface AdminListRolePutInWebRoleChange {
    name: string;
    value: boolean;
    activeBefore?: number | null;
}

export interface AdminListRolePutInWeb {
    roles: AdminListRolePutInWebRoleChange[];
    privilegeLevel: number;
}

export interface AdminListRolePatchInWeb {
    name: string;
    value?: boolean | number | null;
    activeBefore?: number | null;
}

export interface AdminListGlobalOutWeb {
    id?: number;
    listTypeId?: number;
    parentListInstanceId?: number | null;
    sourceUserId?: string | null;
    comment?: string | null;
}

export interface AdminListRawRoleItem {
    owner?: string | null;
    name: string;
    value: number;
}

export interface AdminListRawChangeItem {
    targetUserId: string;
    purge?: boolean;
    roles?: AdminListRawRoleItem[] | null;
}

export interface AdminListRawChangesInWeb {
    changes: AdminListRawChangeItem[];
}

export interface AdminListRoleUsersOutWebUser {
    userId?: string | null;
    value?: number;
    grantedBy?: string | null;
    activeBefore?: number | null;
}

export interface AdminListRoleUsersOutWeb {
    name?: string;
    users?: AdminListRoleUsersOutWebUser[];
}

// ---- Шаблоны админ-листа (/v1/admin-lists/{listId}/templates, см. openApi.yml) ----
// value: `true` — грант роли, `false` — снятие. Срок в шаблоне не хранится — шаблон
// бессрочный, срок выставляется уже после применения штатными контролами.
export interface AdminListTemplateRoleWeb {
    name: string;
    value: boolean;
}

export interface AdminListTemplateOutWeb {
    id?: number;
    listInstanceId?: number;
    name?: string;
    description?: string | null;
    roles?: AdminListTemplateRoleWeb[];
    privilegeLevel?: number;
}

export interface AdminListTemplateInWeb {
    name: string;
    description?: string | null;
    roles: AdminListTemplateRoleWeb[];
    // обязателен, минимум 1
    privilegeLevel: number;
}
