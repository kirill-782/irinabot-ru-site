import Axios, { AxiosRequestConfig } from "axios";
import {
    AdminListFullOutWeb,
    AdminListInstance,
    AdminListPatchInWeb,
    AdminListRolePatchInWeb,
    AdminListRolePutInWeb,
    AdminListSummaryOutWeb,
    AdminListUserListOutWeb,
    AdminListUserOutWeb,
} from "../models/rest/AdminList";
import { RequestOptions } from "./MapService";

export class AdminListService {
    public defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    public getAdminLists = async (options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/admin-lists",
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<AdminListSummaryOutWeb[]>(request);

        return response.data;
    };

    public createAdminList = async (options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/admin-lists",
            method: "POST",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<AdminListInstance>(request);

        return response.data;
    };

    public getAdminList = async (listId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/admin-lists/${listId}`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<AdminListFullOutWeb>(request);

        return response.data;
    };

    public patchAdminList = async (
        listId: number,
        data: AdminListPatchInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<AdminListPatchInWeb> = {
            ...this.defaultConfig,
            url: `/v1/admin-lists/${listId}`,
            method: "PATCH",
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

    public deleteAdminList = async (listId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/admin-lists/${listId}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    public getAdminListUsers = async (listId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/admin-lists/${listId}/users`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<AdminListUserListOutWeb[]>(request);

        return response.data;
    };

    public getAdminListUser = async (listId: number, userId: string, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/admin-lists/${listId}/users/${encodeURIComponent(userId)}`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<AdminListUserOutWeb>(request);

        return response.data;
    };

    public replaceAdminListUser = async (
        listId: number,
        userId: string,
        data: AdminListRolePutInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<AdminListRolePutInWeb> = {
            ...this.defaultConfig,
            url: `/v1/admin-lists/${listId}/users/${encodeURIComponent(userId)}`,
            method: "PUT",
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

    public deleteAdminListUser = async (
        listId: number,
        userId: string,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/admin-lists/${listId}/users/${encodeURIComponent(userId)}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    public patchAdminListUserPrivilegeLevel = async (
        listId: number,
        userId: string,
        privilegeLevel: number,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/admin-lists/${listId}/users/${encodeURIComponent(userId)}/privilege-level`,
            method: "PATCH",
            params: {
                privilegeLevel,
            },
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    public patchAdminListUserRoles = async (
        listId: number,
        userId: string,
        data: AdminListRolePatchInWeb[],
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<AdminListRolePatchInWeb[]> = {
            ...this.defaultConfig,
            url: `/v1/admin-lists/${listId}/users/${encodeURIComponent(userId)}/roles`,
            method: "PATCH",
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
