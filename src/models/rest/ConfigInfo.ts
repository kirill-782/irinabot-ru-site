/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Config } from './Config';
import type { Map } from './Map';

export type ConfigInfo = {
    readonly id?: number;
    version?: string;
    name?: string;
    status?: ConfigInfo.status;
    readonly lastUpdateDate?: string;
    readonly creationDate?: string;
    mapId?: number;
    map?: Map;
    config?: Config;
};

export namespace ConfigInfo {

    export enum status {
        _0 = '0',
        _1 = '1',
        _2 = '2',
    }


}