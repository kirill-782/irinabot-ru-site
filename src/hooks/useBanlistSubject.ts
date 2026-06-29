import { useContext, useState } from "react";
import { AppRuntimeSettingsContext } from "../context";
import { BanlistSubjectInWeb, BanlistSubjectOutWeb } from "../models/rest/Banlist";

export type BanlistSubjectMode = "userId" | "pvpgn";

export interface UseBanlistSubjectResult {
    subjectMode: BanlistSubjectMode;
    setSubjectMode: (mode: BanlistSubjectMode) => void;
    userId: string;
    setUserId: (value: string) => void;
    pvpgnRealm: string;
    setPvpgnRealm: (value: string) => void;
    pvpgnName: string;
    setPvpgnName: (value: string) => void;
    ipCidr: string;
    setIpCidr: (value: string) => void;
    hardwareId: string;
    setHardwareId: (value: string) => void;
    // сбросить поля под указанный субъект (или пусто) — например, при открытии модалки
    reset: (subject?: BanlistSubjectOutWeb | null) => void;
    // проверка для создания: нужен userId либо realm+name; null — всё ок
    validate: () => string | null;
    buildSubject: () => BanlistSubjectInWeb;
}

const modeFor = (subject?: BanlistSubjectOutWeb | null): BanlistSubjectMode =>
    subject && !subject.matchUserId ? "pvpgn" : "userId";

// Состояние субъекта банлиста (userId / pvpgn + IP / HWID) с валидацией и сборкой
// тела запроса. Общий для формы записи и модалки выдачи нарушения.
export const useBanlistSubject = (
    initialSubject?: BanlistSubjectOutWeb | null
): UseBanlistSubjectResult => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [subjectMode, setSubjectMode] = useState<BanlistSubjectMode>(modeFor(initialSubject));
    const [userId, setUserId] = useState(initialSubject?.matchUserId || "");
    const [pvpgnRealm, setPvpgnRealm] = useState(initialSubject?.matchPvpgnRealm || "");
    const [pvpgnName, setPvpgnName] = useState(initialSubject?.matchPvpgnName || "");
    const [ipCidr, setIpCidr] = useState(initialSubject?.matchIpCidr || "");
    const [hardwareId, setHardwareId] = useState(initialSubject?.matchHardwareId || "");

    const reset = (subject?: BanlistSubjectOutWeb | null) => {
        setSubjectMode(modeFor(subject));
        setUserId(subject?.matchUserId || "");
        setPvpgnRealm(subject?.matchPvpgnRealm || "");
        setPvpgnName(subject?.matchPvpgnName || "");
        setIpCidr(subject?.matchIpCidr || "");
        setHardwareId(subject?.matchHardwareId || "");
    };

    const validate = (): string | null => {
        if (subjectMode === "userId") {
            if (!userId.trim()) return t("banlistEntryFormUserIdRequired");
        } else if (!pvpgnRealm.trim() || !pvpgnName.trim()) {
            return t("banlistEntryFormPvpgnRequired");
        }
        return null;
    };

    const buildSubject = (): BanlistSubjectInWeb => ({
        matchUserId: subjectMode === "userId" ? userId.trim() || null : null,
        matchPvpgnRealm: subjectMode === "pvpgn" ? pvpgnRealm.trim() || null : null,
        matchPvpgnName: subjectMode === "pvpgn" ? pvpgnName.trim() || null : null,
        matchIpCidr: ipCidr.trim() || null,
        matchHardwareId: hardwareId.trim() || null,
    });

    return {
        subjectMode,
        setSubjectMode,
        userId,
        setUserId,
        pvpgnRealm,
        setPvpgnRealm,
        pvpgnName,
        setPvpgnName,
        ipCidr,
        setIpCidr,
        hardwareId,
        setHardwareId,
        reset,
        validate,
        buildSubject,
    };
};
