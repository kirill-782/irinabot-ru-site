import { useContext, useState } from "react";
import { AppRuntimeSettingsContext } from "../context";
import { BanlistViolationTemplateOutWeb } from "../models/rest/Banlist";
import {
    buildInitialDefaultIndex,
    buildInitialGamesResetEnabled,
    buildInitialGrads,
    buildInitialReset,
    buildInitialTimeResetEnabled,
    buildTemplatePayload,
    DurationUnit,
    GraduationDraft,
    TemplateDraftPayloadResult,
} from "../utils/BanlistTemplateDraft";

export interface UseBanlistTemplateDraftResult {
    name: string;
    setName: (value: string) => void;
    tag: string;
    setTag: (value: string) => void;
    reason: string;
    setReason: (value: string) => void;
    grads: GraduationDraft[];
    updateGrad: (index: number, patch: Partial<GraduationDraft>) => void;
    addGrad: () => void;
    removeGrad: (index: number) => void;
    defaultGradIndex: number | null;
    setDefaultGradIndex: (value: number | null) => void;
    timeResetEnabled: boolean;
    setTimeResetEnabled: (value: boolean) => void;
    resetValue: string;
    setResetValue: (value: string) => void;
    resetUnit: DurationUnit;
    setResetUnit: (value: DurationUnit) => void;
    gamesResetEnabled: boolean;
    setGamesResetEnabled: (value: boolean) => void;
    gamesResetCount: string;
    setGamesResetCount: (value: string) => void;
    resetStepCount: string;
    setResetStepCount: (value: string) => void;
    buildPayload: () => TemplateDraftPayloadResult;
}

export const useBanlistTemplateDraft = (
    template?: BanlistViolationTemplateOutWeb | null
): UseBanlistTemplateDraftResult => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [name, setName] = useState(template?.name || "");
    const [tag, setTag] = useState(template?.tag || "");
    const [reason, setReason] = useState(template?.reason || "");

    const [grads, setGrads] = useState<GraduationDraft[]>(() => buildInitialGrads(template));
    const [defaultGradIndex, setDefaultGradIndex] = useState<number | null>(() =>
        buildInitialDefaultIndex(template)
    );

    const [timeResetEnabled, setTimeResetEnabled] = useState(() =>
        buildInitialTimeResetEnabled(template)
    );
    const [resetValue, setResetValue] = useState(() => buildInitialReset(template).value);
    const [resetUnit, setResetUnit] = useState<DurationUnit>(
        () => buildInitialReset(template).unit
    );
    const [gamesResetEnabled, setGamesResetEnabled] = useState(() =>
        buildInitialGamesResetEnabled(template)
    );
    const [gamesResetCount, setGamesResetCount] = useState(
        template?.graduationResetAfterCompletedGames
            ? String(template.graduationResetAfterCompletedGames)
            : "10"
    );
    const [resetStepCount, setResetStepCount] = useState(
        template?.graduationResetStepCount ? String(template.graduationResetStepCount) : ""
    );

    const updateGrad = (index: number, patch: Partial<GraduationDraft>) => {
        setGrads((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    };

    const addGrad = () => {
        setGrads((prev) => {
            const last = prev[prev.length - 1];
            const nextCount = last ? Number(last.minCount || 0) + 1 : 1;
            return [
                ...prev,
                {
                    minCount: String(nextCount),
                    action: "CHAT_RESTRICTION",
                    durationValue: "1",
                    durationUnit: "hours",
                    deferredValue: "",
                    deferredUnit: "none",
                },
            ];
        });
    };

    const removeGrad = (index: number) => {
        setGrads((prev) => prev.filter((_, i) => i !== index));
        setDefaultGradIndex((prev) => {
            if (prev === null || prev === index) return prev === index ? null : prev;
            return prev > index ? prev - 1 : prev;
        });
    };

    const buildPayload = () =>
        buildTemplatePayload(t, {
            name,
            tag,
            reason,
            grads,
            defaultGradIndex,
            timeResetEnabled,
            resetValue,
            resetUnit,
            gamesResetEnabled,
            gamesResetCount,
            resetStepCount,
        });

    return {
        name,
        setName,
        tag,
        setTag,
        reason,
        setReason,
        grads,
        updateGrad,
        addGrad,
        removeGrad,
        defaultGradIndex,
        setDefaultGradIndex,
        timeResetEnabled,
        setTimeResetEnabled,
        resetValue,
        setResetValue,
        resetUnit,
        setResetUnit,
        gamesResetEnabled,
        setGamesResetEnabled,
        gamesResetCount,
        setGamesResetCount,
        resetStepCount,
        setResetStepCount,
        buildPayload,
    };
};
