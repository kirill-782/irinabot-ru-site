export interface RoleDraft {
    activeBefore: string;
    value: boolean | number | null;
}

export interface RoleRow {
    activeBefore: number | null;
    declared: boolean;
    grantedBy: string | null;
    name: string;
    owned: boolean;
    value: boolean | number | null;
}

export interface PendingChange {
    activeBefore: number | null;
    name: string;
    previousValue: boolean | number | null;
    value: boolean | number | null;
}
