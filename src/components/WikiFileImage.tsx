import React, { useContext, useEffect, useState } from "react";
import { Image, ImageProps } from "semantic-ui-react";
import { WikiService } from "../services/WikiService";
import { RestContext } from "../context";
import { DEFAULT_CONFIG } from "../config/ApiConfig";
import { FileLinkDto } from "../models/rest/Wiki";

// Файлы вики. В markdown ссылаются указателем file(uuid) (по аналогии с map(id)).
// Реальная ссылка добывается ПАКЕТНО: все file-указатели документа собирают свои
// id и резолвятся одним запросом POST /v1/files/batch.

// Аутентифицированный клиент приходит из RestContext через loadFileLink(): батчу нужен
// токен пользователя, иначе приватные файлы недоступны (батч вернёт пусто, а редирект на
// /v1/files/{id} в <img>/<a> токен не несёт → 404). Храним последний переданный экземпляр.
let api: WikiService | null = null;
const WIKI_BASE = (DEFAULT_CONFIG.baseURL ?? "").replace(/\/$/, "");

// прямой редирект-эндпоинт — фолбэк, если батч недоступен
export const redirectUrl = (id: string) => `${WIKI_BASE}/v1/files/${encodeURIComponent(id)}`;
// ссылка из батча может быть абсолютной (S3) или относительной — нормализуем
export const absolutize = (url: string) => (url.startsWith("/") ? `${WIKI_BASE}${url}` : url);

// Указатель file(uuid) → uuid (допускаем <...> и пробелы).
export function parseFilePointer(ref?: string): string | null {
    if (!ref) return null;
    const cleaned = ref.trim().replace(/^<|>$/g, "").trim();
    const m = /^file\(\s*([^()\s]+)\s*\)$/i.exec(cleaned);
    return m ? m[1] : null;
}

export function formatFileSize(bytes?: number): string {
    if (bytes == null) return "";
    const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
    let n = bytes;
    let i = 0;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i += 1;
    }
    return `${i === 0 ? n : n.toFixed(1)} ${units[i]}`;
}

// --- Пакетный загрузчик: накапливает id и шлёт один батч на микротаске ---
// Кэш с TTL: presigned-ссылки из батча живут ограниченное время (~10 мин).
const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { dto: FileLinkDto | null; ts: number }>();
const waiters = new Map<string, Array<(dto: FileLinkDto | null) => void>>();
let scheduled = false;

function getCached(id: string): FileLinkDto | null | undefined {
    const e = cache.get(id);
    if (!e) return undefined;
    if (Date.now() - e.ts > TTL_MS) {
        cache.delete(id);
        return undefined;
    }
    return e.dto;
}

function flush() {
    scheduled = false;
    const ids = Array.from(waiters.keys());
    if (ids.length === 0) return;

    const current = new Map(waiters);
    waiters.clear();

    if (!api) {
        // нет аутентифицированного клиента — отдаём null, сработает редирект-фолбэк
        ids.forEach((id) => (current.get(id) || []).forEach((cb) => cb(null)));
        return;
    }

    api.getFileLinks(ids)
        .then((links) => links || [])
        .catch(() => [] as FileLinkDto[])
        .then((links) => {
            const byId = new Map(links.map((l) => [l.id, l]));
            const ts = Date.now();
            ids.forEach((id) => {
                const dto = byId.get(id) ?? null;
                cache.set(id, { dto, ts });
                (current.get(id) || []).forEach((cb) => cb(dto));
            });
        });
}

export function loadFileLink(id: string, client: WikiService): Promise<FileLinkDto | null> {
    api = client;
    const cached = getCached(id);
    if (cached !== undefined) return Promise.resolve(cached);
    return new Promise((resolve) => {
        const arr = waiters.get(id) || [];
        arr.push(resolve);
        waiters.set(id, arr);
        if (!scheduled) {
            scheduled = true;
            queueMicrotask(flush);
        }
    });
}

interface WikiFileImageProps extends Omit<ImageProps, "src" | "id"> {
    id: string;
}

function WikiFileImage({ id, ...props }: WikiFileImageProps) {
    const { wikiApi } = useContext(RestContext);
    const [src, setSrc] = useState<string | undefined>(() => {
        const cached = getCached(id);
        return cached ? absolutize(cached.url) : undefined;
    });

    useEffect(() => {
        let alive = true;
        loadFileLink(id, wikiApi).then((dto) => {
            if (!alive) return;
            // нет в батче (или батч недоступен) — фолбэк на редирект-эндпоинт
            setSrc(dto ? absolutize(dto.url) : redirectUrl(id));
        });
        return () => {
            alive = false;
        };
    }, [id, wikiApi]);

    return <Image {...props} src={src} />;
}

export default WikiFileImage;
