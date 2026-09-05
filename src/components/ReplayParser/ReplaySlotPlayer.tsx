import React, { useContext } from "react";
import { Icon } from "semantic-ui-react";
import { SlotInfo } from "@kokomi/w3g-parser-browser";

import { ReplayContext } from "../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";
import WarcraftIIIText from "../WarcraftIIIText";
import { getComputerTypeKey, getPlayerName, getSlotStatusKey, SLOT_STATUS_OCCUPIED } from "../../utils/ReplayFormat";

interface ReplaySlotPlayerProps {
    slot?: SlotInfo;
}

/**
 * Подпись занимающего слот: ник игрока, тип компьютера или состояние пустого слота.
 *
 * Ник берётся из записей игроков по playerId; у ботов и покинувших лобби записи нет,
 * поэтому имя может не найтись даже для занятого слота.
 */
function ReplaySlotPlayer({ slot }: ReplaySlotPlayerProps) {
    const { replayData } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    if (!slot) return <i>{t("unknown")}</i>;

    if (slot.slotStatus !== SLOT_STATUS_OCCUPIED) return <i>{t(getSlotStatusKey(slot.slotStatus))}</i>;

    if (slot.computer)
        return (
            <>
                <Icon name="desktop" />
                {t(getComputerTypeKey(slot.computerType))}
            </>
        );

    const name = getPlayerName(replayData, slot.playerId);

    return name ? <WarcraftIIIText ignoreTags={["|n"]}>{name}</WarcraftIIIText> : <i>{t("unknown")}</i>;
}

export default ReplaySlotPlayer;
