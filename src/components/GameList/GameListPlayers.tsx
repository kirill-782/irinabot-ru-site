import React, { memo } from "react";
import { List } from "semantic-ui-react";
import { GameSlot } from "../../models/rest/Game";
import GameListPlayerItem from "./GameListPlayerItem";
import "./GameListPlayers.scss";

interface GameListPlayerProps {
    slots: GameSlot[];
}

function GameListPlayers({ slots }: GameListPlayerProps) {
    return (
        <List horizontal>
            {slots.map((slot, index) => {
                return slot.player ? <GameListPlayerItem key={slot.player.name} player={slot.player} slotIndex={index} /> : null;
            })}
        </List>
    );
}

export default memo(GameListPlayers);
