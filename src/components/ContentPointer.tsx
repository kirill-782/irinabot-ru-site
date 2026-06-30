import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "semantic-ui-react";
import Axios from "axios";
import { DEFAULT_CONFIG } from "../config/ApiConfig";
import { Map as MapModel } from "../models/rest/Map";

// Указатель на контент сайта внутри markdown.
// Записывается как ссылка, текст которой "@", а href — вида `тип(аргумент)`:
//   [@](map(74670))  →  ссылка /maps/74670 с названием карты (берётся из API).
//
// Новые типы добавляются в RESOLVERS ниже: достаточно задать маршрут (to) и
// способ получить отображаемый текст (label).

interface PointerResolver {
    to: (arg: string) => string;
    label: (arg: string) => Promise<string>;
    icon?: string;
}

const RESOLVERS: Record<string, PointerResolver> = {
    map: {
        icon: "scroll",
        to: (id) => `/maps/${encodeURIComponent(id)}`,
        label: async (id) => {
            const res = await Axios.request<MapModel>({
                ...DEFAULT_CONFIG,
                url: `/v1/maps/${encodeURIComponent(id)}`,
                method: "GET",
            });
            return res.data.mapInfo?.name || `Карта ${id}`;
        },
    },
};

// Разбор href указателя: `тип(аргумент)`. Допускаем обрамление <...> и пробелы.
// Возвращает null, если это не указатель известного типа.
export function parsePointer(href?: string) {
    if (!href) return null;
    const cleaned = href.trim().replace(/^<|>$/g, "").trim();
    const m = /^([A-Za-z][\w-]*)\s*\(\s*(.+?)\s*\)$/.exec(cleaned);
    if (!m) return null;
    const type = m[1];
    if (!RESOLVERS[type]) return null;
    return { type, arg: m[2] };
}

// Кэш меток на сессию + дедуп одновременных запросов.
const labelCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

function resolveLabel(type: string, arg: string): Promise<string> {
    const key = `${type}:${arg}`;
    const cached = labelCache.get(key);
    if (cached !== undefined) return Promise.resolve(cached);

    let p = inFlight.get(key);
    if (!p) {
        p = RESOLVERS[type].label(arg).then((label) => {
            labelCache.set(key, label);
            inFlight.delete(key);
            return label;
        });
        inFlight.set(key, p);
    }
    return p;
}

interface ContentPointerProps {
    href?: string;
}

function ContentPointer({ href }: ContentPointerProps) {
    const parsed = parsePointer(href);
    const key = parsed ? `${parsed.type}:${parsed.arg}` : "";

    const [label, setLabel] = useState<string | undefined>(() =>
        key ? labelCache.get(key) : undefined
    );

    useEffect(() => {
        const p = parsePointer(href);
        if (!p) return;

        let alive = true;
        resolveLabel(p.type, p.arg)
            .then((l) => alive && setLabel(l))
            .catch(() => alive && setLabel(p.arg)); // не загрузилось — показываем сам аргумент
        return () => {
            alive = false;
        };
    }, [href]);

    // не указатель (на всякий случай) — отрисуем как есть
    if (!parsed) {
        return <span>@{href ? `(${href})` : ""}</span>;
    }

    const resolver = RESOLVERS[parsed.type];

    return (
        <NavLink to={resolver.to(parsed.arg)}>
            {resolver.icon && <Icon name={resolver.icon as any} />}
            {label ?? "…"}
        </NavLink>
    );
}

export default ContentPointer;
