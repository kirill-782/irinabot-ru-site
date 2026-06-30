import { useContext } from "react";
import { AuthContext } from "../context";
import { WikiDto } from "../models/rest/Wiki";

// Права на действия в wiki по матрице ACCESS.md. Считаются на клиенте из claim'ов JWT
// (authorities + sub) и метаданных конкретной wiki (owner). Это лишь для видимости UI —
// итоговое решение всё равно за бэкендом (@PreAuthorize), кнопки прячем «оптимистично».
//
// Ограничение: ACL-роли (EDITOR/VIEWER) на клиенте не видны — их список доступен только
// управляющим (canManage). Поэтому права редактора, выданные через ACL, по UI не
// определяются: edit-кнопки показываем WIKI_ADMIN и владельцу wiki.
export interface WikiAccess {
    isAdmin: boolean; // WIKI_ADMIN — полный доступ ко всем wiki
    isLangAdmin: boolean; // WIKI_LANG_ADMIN — правит словарь локализаций
    isTechAdmin: boolean; // WIKI_TECH_ADMIN — ревизии и удаление файлов
    isOwner: boolean; // wiki.owner == sub
    canEdit: boolean; // создавать/править статьи, файлы, порядок, флаги
    canManage: boolean; // ACL, токены, видимость wiki
    canDeleteFiles: boolean; // удаление файлов — только техадмин
    canSeeRevisions: boolean; // история ревизий — только техадмин
}

export function useWikiAccess(wiki?: WikiDto | null): WikiAccess {
    const { auth } = useContext(AuthContext);
    const token = auth.apiToken;

    const isAdmin = token.hasAuthority("WIKI_ADMIN");
    const isLangAdmin = token.hasAuthority("WIKI_LANG_ADMIN");
    const isTechAdmin = token.hasAuthority("WIKI_TECH_ADMIN");

    const sub = token.getSubject();
    const isOwner = !!wiki && !!sub && wiki.owner === sub;

    return {
        isAdmin,
        isLangAdmin,
        isTechAdmin,
        isOwner,
        canEdit: isAdmin || isOwner,
        canManage: isAdmin || isOwner,
        canDeleteFiles: isTechAdmin,
        canSeeRevisions: isTechAdmin,
    };
}
