import { GameListGame } from "../models/websocket/ServerGameList";

const getFreeSlots = (game: GameListGame): number => {
  let usedSlots = 0;

  game.players.forEach((player) => {
    if (player.name.length === 0) usedSlots++;
  });

  return usedSlots;
};

export const gameTypeComparator = (
  a: GameListGame,
  b: GameListGame
): number => {
  return compareByStarted(a, b) || compareByOtherGame(a, b);
};

export const defaultComparator = (a: GameListGame, b: GameListGame): number => {
  return (
    compareByPassword(a, b) ||
    compareByGamePatch(a, b) ||
    compareByPinnedGamePosition(a, b) ||
    compareByOrderID(a, b) * -1
  );
};

export const freeSlotsComparator = (
  a: GameListGame,
  b: GameListGame
): number => {
  if (Number(a.gameFlags.started) - Number(b.gameFlags.started) !== 0)
    return Number(a.gameFlags.started) - Number(b.gameFlags.started);

  return getFreeSlots(a) - getFreeSlots(b);
};

export const allSlotsComparator = (
  a: GameListGame,
  b: GameListGame
): number => {
  if (Number(a.gameFlags.started) - Number(b.gameFlags.started) !== 0)
    return Number(a.gameFlags.started) - Number(b.gameFlags.started);

  return a.players.length - b.players.length;
};

export const playersOccupiedComparator = (
  a: GameListGame,
  b: GameListGame
): number => {
  if (Number(a.gameFlags.started) - Number(b.gameFlags.started) !== 0)
    return Number(a.gameFlags.started) - Number(b.gameFlags.started);

  return (
    a.players.length - getFreeSlots(a) - (b.players.length - getFreeSlots(b))
  );
};

const compareByPassword = (a: GameListGame, b: GameListGame): number => {
  if (a.gameFlags.hasPassword && b.gameFlags.hasPassword) return 0;

  if (a.gameFlags.hasPassword) return 1;

  if (b.gameFlags.hasPassword) return -1;

  return 0;
};

const compareByStarted = (a: GameListGame, b: GameListGame): number => {
  if (a.gameFlags.started && b.gameFlags.started) return 0;

  if (a.gameFlags.started) return 1;

  if (b.gameFlags.started) return -1;

  return 0;
};

const compareByOtherGame = (a: GameListGame, b: GameListGame): number => {
  if (a.gameFlags.hasOtherGame && b.gameFlags.hasOtherGame) return 0;

  if (a.gameFlags.hasOtherGame) return 1;

  if (b.gameFlags.hasOtherGame) return -1;

  return 0;
};

const compareByGamePatch = (a: GameListGame, b: GameListGame): number => {
  if (a.maxPlayers === 1 && b.maxPlayers === 1) return 0;

  if (a.maxPlayers === 1) return 1;

  if (b.maxPlayers === 1) return -1;

  return 0;
};

const compareByPinnedGamePosition = (
  a: GameListGame,
  b: GameListGame
): number => {
  const order = [1, 3, 0, 2];

  return order.indexOf(a.gamePosition) - order.indexOf(b.gamePosition);
};

// const compareByFullLobby = (a: GameListGame, b: GameListGame): number => {
//   if (getFreeSlots(a) > 0 && getFreeSlots(b) > 0) return 0;

//   if (getFreeSlots(a) > 0) return 1;

//   if (getFreeSlots(b) > 0) return -1;

//   return 0;
// };

const compareByOrderID = (a: GameListGame, b: GameListGame): number => {
  return a.orderID - b.orderID;
};
