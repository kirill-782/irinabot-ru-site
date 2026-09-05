import React from "react";

interface ApmSparklineProps {
    /** Действия по минутам игры. */
    buckets: number[];
    /** Общий максимум по всем игрокам — иначе строки нельзя сравнивать глазами. */
    max: number;
    /** Подпись точки в подсказке: (минута, значение) => текст. */
    getPointTitle: (minute: number, value: number) => string;
}

const WIDTH = 180;
const HEIGHT = 28;
const PADDING = 2;

// Спарклайн действий по минутам. Один график на игрока (малые кратные): цвет здесь ничего
// не кодирует, игрока называет сама строка таблицы, поэтому легенда не нужна.
function ApmSparkline({ buckets, max, getPointTitle }: ApmSparklineProps) {
    if (buckets.length === 0 || max <= 0) return null;

    const stepX = buckets.length > 1 ? (WIDTH - PADDING * 2) / (buckets.length - 1) : 0;
    const toY = (value: number) => HEIGHT - PADDING - (value / max) * (HEIGHT - PADDING * 2);

    const points = buckets.map((value, index) => `${PADDING + index * stepX},${toY(value)}`).join(" ");
    const area = `${PADDING},${HEIGHT - PADDING} ${points} ${PADDING + (buckets.length - 1) * stepX},${
        HEIGHT - PADDING
    }`;

    return (
        <svg className="apm-sparkline" width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <polygon className="area" points={area} />
            <polyline className="line" points={points} />
            {buckets.map((value, index) => (
                // Прозрачная зона попадания на минуту — подсказка средствами SVG, без скриптов.
                <rect
                    key={index}
                    x={PADDING + index * stepX - stepX / 2}
                    y={0}
                    width={Math.max(stepX, 4)}
                    height={HEIGHT}
                    fill="transparent"
                >
                    <title>{getPointTitle(index + 1, value)}</title>
                </rect>
            ))}
        </svg>
    );
}

export default ApmSparkline;
