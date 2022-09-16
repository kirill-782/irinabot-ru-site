/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ConfigInfo } from "./ConfigInfo";
import type { MapInfo } from "./MapInfo";

/**
 * Поля, которые нужно заменить
 */
export type Map = {
  readonly id?: number;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
  shortTag?: string;
  lastUpdateDate?: string;
  creationDate?: string;
  categories?: Array<number>;
  mapInfo?: MapInfo;
  additionalFlags?: Record<string, any>;
  configs?: Array<ConfigInfo>;
  verified?: boolean;
  semanticCheckError?: boolean
};
