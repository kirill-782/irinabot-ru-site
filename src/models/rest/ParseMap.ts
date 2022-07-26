import { Map } from "./Map";

export interface ParseMap extends Pick<Map, "creationDate" | "lastUpdateDate"> {
  status: number;
  version: string;
}
