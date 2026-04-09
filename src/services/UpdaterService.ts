import Axios, { AxiosRequestConfig } from "axios";
import {
    BatchUploadDryRunOut,
    BatchUploadRequest,
    BatchUploadResultOut,
    SingleVersionUploadRequest,
    UploadVersionDryRunOut,
    UploadVersionResultOut,
} from "../models/rest/Updater";
import { RequestOptions } from "./MapService";

export class UpdaterService {
    public defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    public uploadVersion = async (params: SingleVersionUploadRequest, options?: RequestOptions) => {
        let request: AxiosRequestConfig<FormData> = {
            ...this.defaultConfig,
            url: "/v1/updates",
            method: "POST",
        };

        request = this.appendOptions(request, options);
        request.data = this.getSingleVersionUploadBody(params);

        const response = await Axios.request<UploadVersionResultOut>(request);

        return response.data;
    };

    public uploadVersionDryRun = async (params: SingleVersionUploadRequest, options?: RequestOptions) => {
        let request: AxiosRequestConfig<FormData> = {
            ...this.defaultConfig,
            url: "/v1/updates/dry-run",
            method: "POST",
        };

        request = this.appendOptions(request, options);
        request.data = this.getSingleVersionUploadBody(params);

        const response = await Axios.request<UploadVersionDryRunOut>(request);

        return response.data;
    };

    public uploadBatch = async (params: BatchUploadRequest, options?: RequestOptions) => {
        let request: AxiosRequestConfig<FormData> = {
            ...this.defaultConfig,
            url: "/v1/updates/batch",
            method: "POST",
        };

        request = this.appendOptions(request, options);
        request.data = this.getBatchUploadBody(params);

        const response = await Axios.request<BatchUploadResultOut>(request);

        return response.data;
    };

    public uploadBatchDryRun = async (params: BatchUploadRequest, options?: RequestOptions) => {
        let request: AxiosRequestConfig<FormData> = {
            ...this.defaultConfig,
            url: "/v1/updates/batch/dry-run",
            method: "POST",
        };

        request = this.appendOptions(request, options);
        request.data = this.getBatchUploadBody(params);

        const response = await Axios.request<BatchUploadDryRunOut>(request);

        return response.data;
    };

    private getSingleVersionUploadBody(params: SingleVersionUploadRequest) {
        const body = new FormData();

        body.append("version", params.version);
        body.append("channel", params.channel);
        body.append("product", params.product);
        body.append("archive", params.archive);

        return body;
    }

    private getBatchUploadBody(params: BatchUploadRequest) {
        const body = new FormData();

        body.append("channel", params.channel);
        body.append("archive", params.archive);

        return body;
    }

    private appendOptions(request: AxiosRequestConfig, options?: RequestOptions) {
        if (!options) return request;

        request.onUploadProgress = options.onUploadProgress;
        request.onDownloadProgress = options.onDownloadProgress;
        request.signal = options.signal;

        return request;
    }
}
