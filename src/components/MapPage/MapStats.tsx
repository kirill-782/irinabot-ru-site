import { Icon, Label } from "semantic-ui-react";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { memo, useMemo } from "react";
import React from "react";

export interface MapStatsProps {
  gameList: GameListGame[];
  mapId: number;
  className?: string;
}

const getPlayerSlots = (game: GameListGame): number => {
  let usedSlots = 0;

  game.players.forEach((player) => {
    if (player.name.length > 0) usedSlots++;
  });

  return usedSlots;
};

function MapStats({ gameList, mapId, className }: MapStatsProps) {
  const [allPlayers, lobbyPlayers] = useMemo(() => {
    let allPlayers = 0;
    let lobbyPlayers = 0;

    gameList.forEach((i) => {
      if (i.mapId === mapId) {
        allPlayers += getPlayerSlots(i);

        if (!i.gameFlags.started) lobbyPlayers += getPlayerSlots(i);
      }
    });

    return [allPlayers, lobbyPlayers];
  }, [gameList]);

  return gameList.length === 0 ? null : (
    <>
      <Label className={className} title="Игроков в играх">
        <Icon name="user"></Icon>
        {allPlayers}
      </Label>
      <Label className={className} title="Игроков в лобби">
        <Icon name="wait"></Icon>
        {lobbyPlayers}
      </Label>
    </>
  );
}

export default memo(MapStats);
