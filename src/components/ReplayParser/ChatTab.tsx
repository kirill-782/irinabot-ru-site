import React, { useContext, useState } from "react";
import { Checkbox, Item, Message } from "semantic-ui-react";
import prettyMilliseconds from "pretty-ms";

import { ReplayContext } from "../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";
import WarcraftIIIText from "../WarcraftIIIText";
import {
    CHAT_FLAG_LOBBY,
    getChatTarget,
    getColorClass,
    getPlayerName,
    getSlotByPlayerId,
    SLOT_STATUS_OCCUPIED,
} from "../../utils/ReplayFormat";

import "./ChatTab.scss";

function ChatTab() {
    const { replayData } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [showLobby, setShowLobby] = useState(true);

    const slots = replayData.records.startInfo?.slots || [];
    const messages = replayData.records.chatMessages.filter(
        (message) => showLobby || message.flags !== CHAT_FLAG_LOBBY
    );

    // Получатель приватного сообщения закодирован номером своего цвета. У наблюдателей цвет
    // общий на всех, поэтому опознаём игрока, только если такой цвет ровно один.
    const getTargetName = (targetColor: number) => {
        const matches = slots.filter((slot) => slot.slotStatus === SLOT_STATUS_OCCUPIED && slot.color === targetColor);
        const name = matches.length === 1 ? getPlayerName(replayData, matches[0].playerId) : undefined;

        return name || t("replayChatTargetColorFallback", { color: targetColor });
    };

    return (
        <div className="replay-chat-tab">
            <Checkbox
                toggle
                className="chat-filter"
                label={t("replayChatShowLobby")}
                checked={showLobby}
                onChange={(_, data) => setShowLobby(!!data.checked)}
            />

            {messages.length === 0 && <Message content={t("replayChatEmpty")} />}

            {messages.map((message, index) => {
                const name = getPlayerName(replayData, message.playerId);
                const slot = getSlotByPlayerId(replayData, message.playerId);
                const target = getChatTarget(message.flags, message.chatMode);

                return (
                    <div key={index} className="chat-row">
                        <span className="time">({prettyMilliseconds(message.time)})</span>
                        <span className="target">
                            [
                            {target.targetColor === undefined
                                ? t(target.key)
                                : `${t(target.key)} → ${getTargetName(target.targetColor)}`}
                            ]
                        </span>
                        <Item as="a" className={`player-name ${getColorClass(slot?.color)}`}>
                            <WarcraftIIIText ignoreTags={["|n"]}>{name || t("unknown")}</WarcraftIIIText>
                        </Item>
                        <span className="message">{message.message}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default ChatTab;
