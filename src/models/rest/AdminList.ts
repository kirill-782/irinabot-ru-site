export interface AdminList {
    id: number;
    name: string;
    parentId?: number;
    activeUntil?: Date;
    itemsActiveUntil?: Date;
    isDefault: boolean;
    owner?: string;
    comment?: string | null;
    valueChangeType?: number;
    privilegeLevel?: number;
    roles: Role[];
    assignments: UserRoleAssignment[];
}

export interface Role {
    id?: number; // Опционально, если идентификация по name
    name: string;
    permissions?: string[];
    validUntil?: Date;
    isDeclared?: boolean;
    owned?: boolean;
}

export interface UserRoleAssignment {
    id: number;
    userId: number;
    roleId: number;
    assignedBy: number;
    assignedAt: Date;
    validUntil?: Date;
}

export interface User {
    id: number;
    nickname: string;
    powerMetric: number;
}
