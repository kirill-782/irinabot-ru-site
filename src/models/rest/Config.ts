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
    info: string;
    crc: string;
    sha1: string;
    fileSha1: string;
    playableSlots: Array<Slot>;
    observerSlots?: Array<Slot>;
    maxPlayers: number;
    versionPrefix?: string;
    productID?: string;
    broadcast?: boolean;
    domain?: string;
};
