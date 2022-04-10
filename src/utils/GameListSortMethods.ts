import { GameListGame } from "../models/websocket/ServerGameList";

const getFreeSlots = (game: GameListGame): number => {
  let usedSlots = 0;

  game.players.forEach((player) => {
    if (player.name.length == 0) usedSlots++;
  });

  return usedSlots;
};

export const defaultGameListOrder = (
  a: GameListGame,
  b: GameListGame
): number => {
  if (Number(a.started) - Number(b.started) != 0)
    return Number(a.started) - Number(b.started);

  if (Number(a.hasPassword) - Number(b.hasPassword) != 0)
    return Number(a.hasPassword) - Number(b.hasPassword);

  if (a.maxPlayers != 1 || b.maxPlayers != 1)
    return b.maxPlayers - b.maxPlayers;

  if (a.gamePosition == 1 && b.gamePosition != 1) return -1;

  if (a.gamePosition == 3 && b.gamePosition != 3) return -1;

  if (a.gamePosition != 2 && b.gamePosition == 2) return -1;

  if (getFreeSlots(a) > 0 && getFreeSlots(b) == 0) return -1;

  return a.orderID - b.orderID;
};

export const freeSlotsOrder = (a: GameListGame, b: GameListGame): number => {
  if (Number(a.started) - Number(b.started) != 0)
    return Number(a.started) - Number(b.started);

  return getFreeSlots(a) - getFreeSlots(b);
};

export const allSlotsOrder = (a: GameListGame, b: GameListGame): number => {
  if (Number(a.started) - Number(b.started) != 0)
    return Number(a.started) - Number(b.started);

  return a.players.length - b.players.length;
};

export const playerCountOrder = (a: GameListGame, b: GameListGame): number => {
  if (Number(a.started) - Number(b.started) != 0)
    return Number(a.started) - Number(b.started);

  return (
    a.players.length - getFreeSlots(a) - (b.players.length - getFreeSlots(b))
  );
};
