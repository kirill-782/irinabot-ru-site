// Типы Wiki API (кастомные контроллеры /v1/* из openapi.yaml, версия 0.2.0).
// Низкоуровневые Spring Data REST репозитории (/articleModels, /wikiModels и т.д.)
// здесь намеренно не описаны — наружу они не выставлены, прикладной слой ходит в /v1/*.

export type WikiVisibility = "PUBLIC" | "PRIVATE";
export type WikiAclRole = "VIEWER" | "EDITOR";
export type WikiTokenRole = "READ" | "WRITE";
export type WikiFileKind = "IMAGE" | "FILE";

// /v1/lang — плоская карта ключ → перевод
export type WikiLangMap = Record<string, string>;

// Узел дерева статей (боковое меню). Без payload.
export interface ArticleNodeDto {
    id: number;
    url: string;
    title: string;
    locale: string;
    parentId: number | null;
    hasChild: boolean;
    hasPayload: boolean;
    hidden?: boolean;
    locked?: boolean;
    position?: number;
}

// Статья с контентом для конкретной локали.
export interface ArticleDto {
    id: number;
    url: string;
    title: string;
    payload: string;
    locale: string;
    version: number;
}

export interface WikiDto {
    id: number;
    url: string;
    owner: string;
    visibility: WikiVisibility;
}

export interface AclEntryDto {
    userId: string;
    role: WikiAclRole;
}

// Токен без секрета (список выданных токенов).
export interface WikiTokenDto {
    id: number;
    name: string;
    role: WikiTokenRole;
    active: boolean;
    createdAt: string;
}

// Возвращается один раз при создании — содержит сам секрет (uuid).
export interface WikiTokenSecretDto {
    id: number;
    name: string;
    role: WikiTokenRole;
    token: string;
}

export interface FileDto {
    id: string;
    name: string;
    contentType: string;
    size: number;
    width?: number;
    height?: number;
    kind: string;
    url: string;
}

// Прямая ссылка на файл из пакетного запроса POST /v1/files/batch.
export interface FileLinkDto {
    id: string;
    url: string;
    name: string;
    contentType: string;
    kind: string;
    size: number;
    width?: number;
    height?: number;
}

export interface BatchFileRequest {
    ids: string[];
}

export interface RevisionDto {
    version: number;
    locale: string;
    title: string;
    payload: string;
    editor: string;
    createdAt: string;
}

// --- Тела запросов ---

export interface CreateWikiRequest {
    url: string;
    visibility?: WikiVisibility;
    owner?: string;
}

export interface UpdateVisibilityRequest {
    visibility: WikiVisibility;
}

export interface CreateArticleRequest {
    url: string;
    parentId?: number;
    hidden?: boolean;
    locked?: boolean;
}

// Перенос статьи к другому родителю. parentId не задан → в корень.
export interface MoveArticleRequest {
    parentId?: number;
}

// Свойства статьи (уровень статьи, не пейлоада/локали). PATCH /v1/article/{id}.
export interface UpdateArticleRequest {
    hidden?: boolean;
    locked?: boolean;
}

// Новый порядок статей-соседей (id в нужном порядке). PUT /v1/wiki/{wikiUrl}/articles/order.
export interface ReorderArticlesRequest {
    orderedIds: number[];
}

export interface SavePayloadRequest {
    locale: string;
    title?: string;
    payload?: string;
    hidden?: boolean;
    locked?: boolean;
}

export interface SetAclRoleRequest {
    role: WikiAclRole;
}

export interface CreateTokenRequest {
    name?: string;
    role: WikiTokenRole;
}
