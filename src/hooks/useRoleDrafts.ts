import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { RoleDraft, RoleRow } from "../components/AdminList/interfaces";
import { cascadeHierarchyDrafts } from "../utils/adminListRoleModel";
import { toDateTimeLocalInputValue } from "../utils/AdminListUtils";

// Черновик роли в состоянии «как в исходных данных» (baseline). Для строк без даты
// (шаблоны — activeBefore = null) даёт пустую строку, для срочных ролей — локальную дату.
const draftFromRow = (role: RoleRow): RoleDraft => ({
    value: role.value ?? null,
    activeBefore: toDateTimeLocalInputValue(role.activeBefore),
});

export interface UseRoleDraftsResult {
    roleDrafts: Record<string, RoleDraft>;
    setRoleDrafts: Dispatch<SetStateAction<Record<string, RoleDraft>>>;
    // множество имён ролей и быстрый доступ по имени — для каскада и точечных операций
    presentRoleNames: Set<string>;
    roleByName: Map<string, RoleRow>;
    // текущий черновик роли (с фолбэком на baseline); можно передать иной снимок drafts
    getDraft: (role: RoleRow, drafts?: Record<string, RoleDraft>) => RoleDraft;
    // изменить роль с каскадом по иерархии прав
    handleDraftChange: (roleName: string, next: RoleDraft) => void;
    // сбросить правку одной роли к baseline
    handleResetRow: (roleName: string) => void;
    // пометить роль на удаление (значение null)
    handleMarkForDeletion: (role: RoleRow) => void;
    // сбросить все правки к baseline
    resetDrafts: () => void;
}

// Общий «плюминг» редактора ролей: состояние черновиков + каскад иерархии + типовые
// операции. roleRows каждый родитель строит по-своему (пользователь / шаблон), а хук
// синхронизирует черновики с ними и даёт единый набор обработчиков.
export const useRoleDrafts = (roleRows: RoleRow[]): UseRoleDraftsResult => {
    const [roleDrafts, setRoleDrafts] = useState<Record<string, RoleDraft>>({});

    const presentRoleNames = useMemo(() => new Set(roleRows.map((role) => role.name)), [roleRows]);
    const roleByName = useMemo(
        () => new Map(roleRows.map((role) => [role.name, role])),
        [roleRows]
    );

    const buildBaseline = useCallback(
        () =>
            roleRows.reduce<Record<string, RoleDraft>>((acc, role) => {
                acc[role.name] = draftFromRow(role);
                return acc;
            }, {}),
        [roleRows]
    );

    // при смене исходных строк (перезагрузка данных) черновики сбрасываются к baseline
    useEffect(() => {
        setRoleDrafts(buildBaseline());
    }, [buildBaseline]);

    const getDraft = useCallback(
        (role: RoleRow, drafts: Record<string, RoleDraft> = roleDrafts) =>
            drafts[role.name] || draftFromRow(role),
        [roleDrafts]
    );

    const handleDraftChange = useCallback(
        (roleName: string, next: RoleDraft) => {
            setRoleDrafts((current) =>
                cascadeHierarchyDrafts(current, roleName, next, presentRoleNames)
            );
        },
        [presentRoleNames]
    );

    const handleResetRow = useCallback((roleName: string) => {
        setRoleDrafts((current) => {
            const { [roleName]: _omit, ...rest } = current;
            return rest;
        });
    }, []);

    const handleMarkForDeletion = useCallback((role: RoleRow) => {
        setRoleDrafts((current) => ({
            ...current,
            [role.name]: { value: null, activeBefore: "" },
        }));
    }, []);

    const resetDrafts = useCallback(() => setRoleDrafts(buildBaseline()), [buildBaseline]);

    return {
        roleDrafts,
        setRoleDrafts,
        presentRoleNames,
        roleByName,
        getDraft,
        handleDraftChange,
        handleResetRow,
        handleMarkForDeletion,
        resetDrafts,
    };
};
