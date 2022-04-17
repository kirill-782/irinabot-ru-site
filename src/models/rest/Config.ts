/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Slot } from "./Slot";

/**
 * Обновленный конфиг
 */
export type Config = {
  numPlayers: number;
  numTeams: number;
  options: number;
  width: number;
  height: number;
  size: number;
  info: Array<string>;
  crc: Array<string>;
  sha1: Array<string>;
  fileSha1: Array<string>;
  playableSlots: Array<Slot>;
  observerSlots?: Array<Slot>;
  maxPlayers: number;
  versionPrefix?: Array<string>;
  productID?: Array<string>;
  broadcast?: boolean;
  domain?: string;
};
