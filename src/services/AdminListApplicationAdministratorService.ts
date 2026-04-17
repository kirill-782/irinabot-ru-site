import Axios, { AxiosRequestConfig } from "axios";
import {
    AdminListGlobalOutWeb,
    AdminListRawChangesInWeb,
    AdminListRoleUsersOutWeb,
} from "../models/rest/AdminList";
import { RequestOptions } from "./MapService";

export class AdminListApplicationAdministratorService {
    public defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    public getGlobalAdminLists = async (options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/admin-lists-app-admin/global",
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<AdminListGlobalOutWeb[]>(request);

        return response.data;
    };

    public invalidateCache = async (options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/admin-lists-app-admin/cache",
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    public invalidateUserCache = async (
        userId: string,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/admin-lists-app-admin/cache/${encodeURIComponent(userId)}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    public initUser = async (
        userId: string,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/admin-lists-app-admin/init/${encodeURIComponent(userId)}`,
            method: "POST",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    public getListRoles = async (
        listId: number,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/admin-lists-app-admin/${listId}/roles`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<AdminListRoleUsersOutWeb[]>(request);

        return response.data;
    };

    public applyRawChanges = async (
        listId: number,
        data: AdminListRawChangesInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<AdminListRawChangesInWeb> = {
            ...this.defaultConfig,
            url: `/v1/admin-lists-app-admin/raw/${listId}`,
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
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
