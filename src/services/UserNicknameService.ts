import Axios, { AxiosRequestConfig } from "axios";
import { UserNicknameSearchOutWeb } from "../models/rest/UserNickname";
import { RequestOptions } from "./MapService";

export class UserNicknameService {
    public defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    // Поиск игроков по префиксу ника (ILIKE 'query%'). count: по умолчанию 20, не более 50.
    public searchNicknames = async (query: string, count = 20, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/nicknames/search",
            method: "GET",
            params: { query, count },
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<UserNicknameSearchOutWeb[]>(request);

        return response.data;
    };

    private appendOptions(request: AxiosRequestConfig, options?: RequestOptions) {
        if (!options) return request;

        request.onUploadProgress = options.onUploadProgress;
        request.onDownloadProgress = options.onDownloadProgress;
        request.signal = options.signal;

        return request;
    }
}
