import { AxiosRequestConfig } from "axios";

export const DEFAULT_CONFIG: AxiosRequestConfig = {
    baseURL: window.location.host === "irinabot.com" ?  "https://apicf.irinabot.com/" :  "https://api.irinabot.ru/",
};

export const ANONYMOUS_AUTHORITIES = ["MAP_READ", "MAP_READ_GLOBAL"];
