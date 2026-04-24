import Axios, { AxiosRequestConfig } from "axios";
import {
    HostPresetCreateInWeb,
    HostPresetListItemOutWeb,
    HostPresetOutWeb,
    HostPresetPatchInWeb,
    HostPresetPropertyInWeb,
    HostPresetPropertyOutWeb,
} from "../models/rest/HostPreset";
import { RequestOptions } from "./MapService";

export class HostPresetService {
    public defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    public getHostPresets = async (options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/host-presets",
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<HostPresetListItemOutWeb[]>(request);

        return response.data;
    };

    public createHostPreset = async (data: HostPresetCreateInWeb, options?: RequestOptions) => {
        let request: AxiosRequestConfig<HostPresetCreateInWeb> = {
            ...this.defaultConfig,
            url: "/v1/host-presets",
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<HostPresetOutWeb>(request);

        return response.data;
    };

    public getHostPreset = async (presetId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/host-presets/${presetId}`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<HostPresetOutWeb>(request);

        return response.data;
    };

    public patchHostPreset = async (
        presetId: number,
        data: HostPresetPatchInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<HostPresetPatchInWeb> = {
            ...this.defaultConfig,
            url: `/v1/host-presets/${presetId}`,
            method: "PATCH",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<HostPresetOutWeb>(request);

        return response.data;
    };

    public deleteHostPreset = async (presetId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/host-presets/${presetId}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    public getHostPresetProperties = async (options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/host-presets/properties",
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<HostPresetPropertyOutWeb[]>(request);

        return response.data;
    };

    public createHostPresetProperty = async (
        data: HostPresetPropertyInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<HostPresetPropertyInWeb> = {
            ...this.defaultConfig,
            url: "/v1/host-presets/properties",
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<HostPresetPropertyOutWeb>(request);

        return response.data;
    };

    public getHostPresetProperty = async (propertyId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/host-presets/properties/${propertyId}`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<HostPresetPropertyOutWeb>(request);

        return response.data;
    };

    public updateHostPresetProperty = async (
        propertyId: number,
        data: HostPresetPropertyInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<HostPresetPropertyInWeb> = {
            ...this.defaultConfig,
            url: `/v1/host-presets/properties/${propertyId}`,
            method: "PUT",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<HostPresetPropertyOutWeb>(request);

        return response.data;
    };

    public deleteHostPresetProperty = async (propertyId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/host-presets/properties/${propertyId}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

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
