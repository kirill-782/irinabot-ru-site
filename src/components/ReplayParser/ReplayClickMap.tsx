import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Checkbox, Form, Loader, Message } from "semantic-ui-react";
import ReactSlider from "react-slider";
import prettyMilliseconds from "pretty-ms";

import { ReplayContext } from "../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";
import ReplaySlotPlayer from "./ReplaySlotPlayer";
import { useReplayMinimap } from "../../hooks/useReplayMinimap";
import { deriveMapBounds, extractClicks, getMapBounds, toMinimapUv } from "../../utils/ReplayClicks";
import { getColorHex, getSlotByPlayerId } from "../../utils/ReplayFormat";

// Миникарта отдаётся размером 256×256; рисуем вдвое крупнее, чтобы точки не слипались.
const CANVAS_SIZE = 512;
const PING_RADIUS_FACTOR = 2.5;

function ReplayClickMap() {
    const { replayData, replayActions } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const statString = replayData.records.gameInfo?.statString;
    const duration = replayData.records.duration;

    const { imageUrl, isLoading, mapId } = useReplayMinimap(statString?.mapPath);

    const points = useMemo(() => extractClicks(replayActions), [replayActions]);

    // Размер карты из реплея точен и позволяет наложить миникарту; выведенный из точек —
    // только приблизительный масштаб, поэтому подложку с ним не показываем.
    const mapBounds = getMapBounds(statString);
    const bounds = useMemo(() => mapBounds || deriveMapBounds(points), [mapBounds, points]);
    const boundsAreDerived = !mapBounds && !!bounds;

    const playerIds = useMemo(
        () => [...new Set(points.map((point) => point.playerId))].sort((a, b) => a - b),
        [points]
    );

    const [hidden, setHidden] = useState<number[]>([]);
    const [range, setRange] = useState<[number, number]>([0, duration]);
    const [pointSize, setPointSize] = useState(3);
    const [showPings, setShowPings] = useState(true);

    // Фон грузится асинхронно, поэтому держим готовое изображение в состоянии.
    const [background, setBackground] = useState<HTMLImageElement>();

    useEffect(() => {
        if (!imageUrl) {
            setBackground(undefined);

            return;
        }

        const image = new Image();
        let cancelled = false;

        image.crossOrigin = "anonymous";
        image.onload = () => {
            if (!cancelled) setBackground(image);
        };
        image.onerror = () => {
            if (!cancelled) setBackground(undefined);
        };
        image.src = imageUrl;

        return () => {
            cancelled = true;
        };
    }, [imageUrl]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (!canvas || !context) return;

        context.fillStyle = "#000000";
        context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        if (background && !boundsAreDerived) context.drawImage(background, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

        if (!bounds) return;

        const skip = new Set(hidden);

        points.forEach((point) => {
            if (skip.has(point.playerId)) return;
            if (point.time < range[0] || point.time > range[1]) return;
            if (!showPings && point.kind === "ping") return;

            const uv = toMinimapUv(point, bounds);

            if (!uv) return;

            const slot = getSlotByPlayerId(replayData, point.playerId);
            const radius = point.kind === "ping" ? pointSize * PING_RADIUS_FACTOR : pointSize;

            context.beginPath();
            context.arc(uv.u * CANVAS_SIZE, uv.v * CANVAS_SIZE, radius, 0, Math.PI * 2);

            if (point.kind === "ping") {
                context.strokeStyle = getColorHex(slot?.color);
                context.lineWidth = 2;
                context.stroke();
            } else {
                context.fillStyle = getColorHex(slot?.color);
                context.fill();
            }
        });
    }, [points, background, bounds, boundsAreDerived, hidden, range, pointSize, showPings, replayData]);

    const togglePlayer = (playerId: number) =>
        setHidden((current) =>
            current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId]
        );

    const shown = points.filter(
        (point) =>
            !hidden.includes(point.playerId) &&
            point.time >= range[0] &&
            point.time <= range[1] &&
            (showPings || point.kind !== "ping")
    ).length;

    return (
        <div className="replay-click-map">
            {!bounds && <Message warning content={t("replayClickMapNoBounds")} />}
            {boundsAreDerived && <Message warning content={t("replayClickMapDerivedBounds")} />}
            {bounds && points.length === 0 && <Message content={t("replayClickMapNoPoints")} />}
            {bounds && !boundsAreDerived && !imageUrl && !isLoading && (
                <Message
                    content={mapId ? t("replayClickMapNoImage", { id: mapId }) : t("replayClickMapNoMapId")}
                />
            )}

            <div className="click-map-layout">
                <div className="click-map-canvas">
                    {isLoading && <Loader active inline="centered" />}
                    <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
                </div>

                <Form className="click-map-controls">
                    <Form.Field>
                        <label>
                            {t("replayClickMapRange", {
                                from: prettyMilliseconds(range[0]),
                                to: prettyMilliseconds(range[1]),
                            })}
                        </label>
                        <ReactSlider
                            value={range}
                            min={0}
                            max={duration}
                            step={1000}
                            onChange={(value) => setRange(value as [number, number])}
                            renderThumb={(props) => <div {...props} />}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>{t("replayClickMapPointSize")}</label>
                        <ReactSlider
                            value={pointSize}
                            min={1}
                            max={8}
                            step={1}
                            onChange={(value) => setPointSize(value as number)}
                            renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                        />
                    </Form.Field>

                    <Checkbox
                        toggle
                        label={t("replayClickMapShowPings")}
                        checked={showPings}
                        onChange={(_, data) => setShowPings(!!data.checked)}
                    />

                    <div className="click-map-players">
                        {playerIds.map((playerId) => {
                            const slot = getSlotByPlayerId(replayData, playerId);

                            return (
                                <Checkbox
                                    key={playerId}
                                    className="player-toggle"
                                    checked={!hidden.includes(playerId)}
                                    onChange={() => togglePlayer(playerId)}
                                    label={
                                        <label>
                                            <span
                                                className="wc3-color"
                                                style={{ background: getColorHex(slot?.color) }}
                                            />
                                            <ReplaySlotPlayer slot={slot} />
                                        </label>
                                    }
                                />
                            );
                        })}
                    </div>

                    <div className="click-map-summary">
                        {t("replayClickMapSummary", { shown, total: points.length })}
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default ReplayClickMap;
