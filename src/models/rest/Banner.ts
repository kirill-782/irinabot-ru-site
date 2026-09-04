// Типы баннеров сайта (контроллер /v1/banners из openapi.yaml, Wiki API v1.0.2).
//
// Публичная выдача — BannerDto (GET /v1/banners), управление — BannerAdminDto
// (GET /v1/banners/manage, POST/PUT/DELETE /v1/banners/**; требуется роль админа
// баннеров, по умолчанию WIKI_ADMIN).

// Куда встраивается баннер:
//  GAME_LIST       — строкой внутри таблицы игр (позиция задаётся index/creatorId);
//  ABOVE_GAME_LIST — блоком над таблицей игр.
export type BannerPlacement = "GAME_LIST" | "ABOVE_GAME_LIST";

export const BANNER_PLACEMENTS: BannerPlacement[] = ["GAME_LIST", "ABOVE_GAME_LIST"];

export const BANNER_PLACEMENT_TITLES: Record<BannerPlacement, string> = {
    GAME_LIST: "В списке игр",
    ABOVE_GAME_LIST: "Над списком игр",
};

// Публичный баннер. Отдаются только активные (enabled + попадающие в окно
// startsAt/expiresAt) — фильтровать по времени на клиенте не нужно.
export interface BannerDto {
    id: string;
    placement: BannerPlacement;
    // Ссылка на картинку. Может быть как абсолютной (S3/CDN), так и относительной
    // к API — приводить к абсолютной через WikiService.resolveApiUrl.
    imageUrl: string;
    // Ссылка с учётом клика (редирект на targetUrl), обычно /v1/banners/{id}/click.
    clickUrl: string;
    title?: string;
    // Номер строки в списке игр, после которой вставить баннер.
    index?: number;
    // Показывать рядом с играми этого создателя (альтернатива index).
    creatorId?: number;
    // Приоритетный баннер — показывается всем, включая пользователей с VIP
    // (обычные баннеры владельцам VIP не показываются).
    priority?: boolean;
    width?: number;
    height?: number;
}

// Баннер целиком — для админки.
export interface BannerAdminDto {
    id: string;
    placement: BannerPlacement;
    title?: string;
    targetUrl: string;
    creatorId?: number;
    index?: number;
    weight?: number;
    priority?: boolean;
    enabled?: boolean;
    startsAt?: string;
    expiresAt?: string;
    hasImage?: boolean;
    imageUrl?: string;
    imageContentType?: string;
    imageSizeBytes?: number;
    width?: number;
    height?: number;
    clickCount?: number;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Тело POST /v1/banners и PUT /v1/banners/{id} (PUT заменяет баннер целиком).
export interface BannerRequest {
    placement: BannerPlacement;
    title?: string;
    targetUrl: string;
    creatorId?: number;
    index?: number;
    // Вес в ротации (>= 1): чем больше, тем чаще баннер попадает в выдачу.
    weight?: number;
    priority?: boolean;
    enabled?: boolean;
    startsAt?: string;
    expiresAt?: string;
}

// Клики за день. GET /v1/banners/{id}/stats?days=30.
export interface BannerClickStatDto {
    day: string;
    clicks: number;
}
