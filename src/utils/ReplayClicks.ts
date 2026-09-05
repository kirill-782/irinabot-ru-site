import { StatStringData } from "@kokomi/w3g-parser-browser";
import { ActionData } from "../hooks/useReplayActions";

// Точки на карте, которые можно достать из действий: цели приказов и пинги миникарты.
//
// Координаты — мировые, float32 (в записи это IEEE-754; библиотека читает их как float
// начиная с 0.1.0). Начало координат в центре карты, ось Y направлена вверх.

const ACTION_POSITION_ABILITY = 0x11;
const ACTION_POSITION_OBJECT_ABILITY = 0x12;
const ACTION_ITEM = 0x13;
const ACTION_TWO_TARGET = 0x14;
const ACTION_MINIMAP_PING = 0x68;

export type ClickKind = "order" | "ping";

export interface ClickPoint {
    playerId: number;
    /** Мировая координата. */
    x: number;
    y: number;
    time: number;
    kind: ClickKind;
}

const isUsable = (value: unknown): value is number => typeof value === "number" && isFinite(value);

const push = (points: ClickPoint[], playerId: number, time: number, kind: ClickKind, x: unknown, y: unknown) => {
    if (!isUsable(x) || !isUsable(y)) return;

    points.push({ playerId, x, y, time, kind });
};

export const extractClicks = (replayActions: ActionData[]): ClickPoint[] => {
    const points: ClickPoint[] = [];

    replayActions.forEach((block) => {
        block.commandBlocks.forEach((commandBlock) => {
            commandBlock.actions.forEach((action) => {
                const pid = commandBlock.playerId;
                const data = action as Record<string, unknown>;

                switch (action.type) {
                    case ACTION_POSITION_ABILITY:
                        push(points, pid, block.time, "order", data.x, data.y);
                        break;
                    case ACTION_POSITION_OBJECT_ABILITY:
                    case ACTION_ITEM:
                        push(points, pid, block.time, "order", data.targetX, data.targetY);
                        break;
                    case ACTION_TWO_TARGET:
                        push(points, pid, block.time, "order", data.targetAX, data.targetAY);
                        push(points, pid, block.time, "order", data.targetBX, data.targetBY);
                        break;
                    case ACTION_MINIMAP_PING:
                        push(points, pid, block.time, "ping", data.x, data.y);
                        break;
                    default:
                        break;
                }
            });
        });
    });

    return points;
};

export interface MapBounds {
    /** Полуширина и полувысота игровой области в мировых единицах. */
    halfWidth: number;
    halfHeight: number;
}

/**
 * Границы игровой области. Размер карты в stat string задан в тайлах, тайл — 128 мировых единиц,
 * начало координат в центре. Некоторые реплеи (встречалось в Reforged) пишут туда нули — тогда
 * границы неизвестны и точки показать не на чем.
 */
export const getMapBounds = (statString?: StatStringData): MapBounds | undefined => {
    if (!statString?.mapWidth || !statString?.mapHeight) return undefined;

    return { halfWidth: (statString.mapWidth * 128) / 2, halfHeight: (statString.mapHeight * 128) / 2 };
};

/**
 * Запасные границы, когда размер карты в реплее не записан (встречалось в Reforged: там stat string
 * приходит с нулями). Берём симметричный квадрат по самой дальней точке — масштаб получается
 * приблизительный, поэтому подложку миникарты в этом случае использовать нельзя: она не совпадёт.
 */
export const deriveMapBounds = (points: ClickPoint[]): MapBounds | undefined => {
    if (points.length === 0) return undefined;

    let half = 0;

    points.forEach((point) => {
        half = Math.max(half, Math.abs(point.x), Math.abs(point.y));
    });

    if (half <= 0) return undefined;

    // Небольшой запас, иначе крайние точки лягут ровно на кромку.
    half *= 1.02;

    return { halfWidth: half, halfHeight: half };
};

/**
 * Переводит мировую координату в долю от миникарты (0..1, начало — левый верхний угол).
 * Клики за пределами игровой области легальны — границы камеры шире, — но на миникарте им
 * места нет, поэтому они отбрасываются.
 */
export const toMinimapUv = (point: ClickPoint, bounds: MapBounds): { u: number; v: number } | undefined => {
    if (Math.abs(point.x) > bounds.halfWidth || Math.abs(point.y) > bounds.halfHeight) return undefined;

    return {
        u: (point.x + bounds.halfWidth) / (bounds.halfWidth * 2),
        // Мировая ось Y направлена вверх, ось изображения — вниз.
        v: 1 - (point.y + bounds.halfHeight) / (bounds.halfHeight * 2),
    };
};

/**
 * Идентификатор карты из пути в реплее: хостбот сохраняет скачанные карты как `<id>_<имя>.w3x`.
 * У карт, скачанных не через бота, префикса нет.
 */
export const getMapIdFromPath = (mapPath?: string): number | undefined => {
    if (!mapPath) return undefined;

    const fileName = mapPath.split(/[\\/]/).pop() || "";
    const match = /^(\d+)_/.exec(fileName);

    if (!match) return undefined;

    const id = Number(match[1]);

    return Number.isFinite(id) && id > 0 ? id : undefined;
};
