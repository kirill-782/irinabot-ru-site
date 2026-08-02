import Axios, { AxiosRequestConfig } from "axios";
import { EntitlementOutWeb } from "../models/rest/Entitlement";
import { RequestOptions } from "./MapService";

// Обёртка над EntitlementController (openApi.yml §Entitlements).
export class EntitlementService {
    public defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    // Агрегированное состояние каждой платной фичи текущего пользователя.
    public getMyEntitlements = async (options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/me/entitlements",
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<EntitlementOutWeb[]>(request);

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
