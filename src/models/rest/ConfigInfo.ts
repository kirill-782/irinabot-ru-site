/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Config } from "./Config";
import type { Map } from "./Map";

export type ConfigInfo = {
    readonly id?: number;
    version?: string;
    name?: string;
    status?: number;
    readonly lastUpdateDate?: string;
    readonly creationDate?: string;
    mapId?: number;
    map?: Map;
    config?: Config;
};
