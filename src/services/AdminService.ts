import Axios, { AxiosRequestConfig } from "axios";
import { AdminList, Role, UserRoleAssignment, User } from "../models/rest/AdminList";

export interface GetAdminListsParams {
    userId?: number;
}

export interface CreateAdminListParams {
    name: string;
    parentId?: number;
}

export interface UpdateAdminListParams {
    id: number;
    name?: string;
    activeUntil?: Date;
    itemsActiveUntil?: Date;
}

export interface AssignRoleParams {
    adminListId: number;
    userId: number;
    roleId: number;
    validUntil?: Date;
}

export interface RemoveAssignmentParams {
    assignmentId: number;
}

export class AdminService {
    private defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    getAdminLists = async (
        params: GetAdminListsParams,
        { ...signal }: AxiosRequestConfig = {}
    ): Promise<AdminList[]> => {
        const request: AxiosRequestConfig = {
            ...this.defaultConfig,
            ...signal,
            url: "/v1/admin-lists",
            method: "GET",
            params,
            validateStatus: (status) => status === 200,
        };
        const response = await Axios.request<AdminList[]>(request);
        return response.data;
    };

    createAdminList = async (
        params: CreateAdminListParams,
        { ...signal }: AxiosRequestConfig = {}
    ): Promise<AdminList> => {
        const request: AxiosRequestConfig = {
            ...this.defaultConfig,
            ...signal,
            url: "/v1/admin-lists",
            method: "POST",
            data: params,
            validateStatus: (status) => status === 201,
        };
        const response = await Axios.request<AdminList>(request);
        return response.data;
    };

    updateAdminList = async (
        params: UpdateAdminListParams,
        { ...signal }: AxiosRequestConfig = {}
    ): Promise<AdminList> => {
        const request: AxiosRequestConfig = {
            ...this.defaultConfig,
            ...signal,
            url: `/v1/admin-lists/${params.id}`,
            method: "PUT",
            data: params,
            validateStatus: (status) => status === 200,
        };
        const response = await Axios.request<AdminList>(request);
        return response.data;
    };

    deleteAdminList = async (id: number, { ...signal }: AxiosRequestConfig = {}): Promise<void> => {
        const request: AxiosRequestConfig = {
            ...this.defaultConfig,
            ...signal,
            url: `/v1/admin-lists/${id}`,
            method: "DELETE",
            validateStatus: (status) => status === 204,
        };
        await Axios.request(request);
    };

    assignRole = async (
        params: AssignRoleParams,
        { ...signal }: AxiosRequestConfig = {}
    ): Promise<UserRoleAssignment> => {
        const request: AxiosRequestConfig = {
            ...this.defaultConfig,
            ...signal,
            url: "/v1/admin-assignments",
            method: "POST",
            data: params,
            validateStatus: (status) => status === 201,
        };
        const response = await Axios.request<UserRoleAssignment>(request);
        return response.data;
    };

    removeAssignment = async (
        params: RemoveAssignmentParams,
        { ...signal }: AxiosRequestConfig = {}
    ): Promise<void> => {
        const request: AxiosRequestConfig = {
            ...this.defaultConfig,
            ...signal,
            url: `/v1/admin-assignments/${params.assignmentId}`,
            method: "DELETE",
            validateStatus: (status) => status === 204,
        };
        await Axios.request(request);
    };

    getUsers = async (query?: string, { ...signal }: AxiosRequestConfig = {}): Promise<User[]> => {
        const request: AxiosRequestConfig = {
            ...this.defaultConfig,
            ...signal,
            url: "/v1/users",
            method: "GET",
            params: { query },
            validateStatus: (status) => status === 200,
        };
        const response = await Axios.request<User[]>(request);
        return response.data;
    };

    getRoles = async ({ ...signal }: AxiosRequestConfig = {}): Promise<Role[]> => {
        const request: AxiosRequestConfig = {
            ...this.defaultConfig,
            ...signal,
            url: "/v1/roles",
            method: "GET",
            validateStatus: (status) => status === 200,
        };
        const response = await Axios.request<Role[]>(request);
        return response.data;
    };
}
