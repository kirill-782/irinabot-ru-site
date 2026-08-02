import Axios, { AxiosRequestConfig } from "axios";
import {
    BanlistCheckRequestInWeb,
    BanlistCheckResultOutWeb,
    BanlistEntriesPage,
    BanlistEntriesQueryParams,
    BanlistEntryInWeb,
    BanlistEntryOutWeb,
    BanlistEntryPatchInWeb,
    BanlistEntryPutInWeb,
    BanlistIncrementRequestInWeb,
    BanlistIncrementResultOutWeb,
    BanlistInWeb,
    BanlistOutWeb,
    BanlistPatchInWeb,
    BanlistsPage,
    BanlistsQueryParams,
    BanlistSubjectOutWeb,
    BanlistSubjectPatchInWeb,
    BanlistViolationStatsOutWeb,
    BanlistViolationStatsPage,
    BanlistViolationStatsPatchInWeb,
    BanlistViolationStatsQueryParams,
    BanlistViolationTemplateInWeb,
    BanlistViolationTemplateOutWeb,
} from "../models/rest/Banlist";
import { RequestOptions } from "./MapService";

export class BanlistService {
    public defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    public getBanlists = async (
        params?: BanlistsQueryParams,
        options?: RequestOptions
    ): Promise<BanlistsPage> => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/banlists",
            method: "GET",
            params,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistOutWeb[]>(request);

        // общее число банлистов под фильтром — в заголовке; без него считаем длину тела
        const totalHeader = response.headers["x-total-count"];
        const total = totalHeader !== undefined ? Number(totalHeader) : response.data.length;

        return {
            banlists: response.data,
            total: Number.isFinite(total) ? total : response.data.length,
        };
    };

    public createBanlist = async (data: BanlistInWeb, options?: RequestOptions) => {
        let request: AxiosRequestConfig<BanlistInWeb> = {
            ...this.defaultConfig,
            url: "/v1/banlists",
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistOutWeb>(request);

        return response.data;
    };

    public getBanlist = async (banlistId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistOutWeb>(request);

        return response.data;
    };

    public patchBanlist = async (banlistId: number, data: BanlistPatchInWeb, options?: RequestOptions) => {
        let request: AxiosRequestConfig<BanlistPatchInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}`,
            method: "PATCH",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistOutWeb>(request);

        return response.data;
    };

    public deleteBanlist = async (banlistId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    public getTemplates = async (banlistId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistViolationTemplateOutWeb[]>(request);

        return response.data;
    };

    public createTemplate = async (
        banlistId: number,
        data: BanlistViolationTemplateInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistViolationTemplateInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates`,
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistViolationTemplateOutWeb>(request);

        return response.data;
    };

    public getTemplate = async (
        banlistId: number,
        templateId: number,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates/${templateId}`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistViolationTemplateOutWeb>(request);

        return response.data;
    };

    public patchTemplate = async (
        banlistId: number,
        templateId: number,
        data: BanlistViolationTemplateInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistViolationTemplateInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates/${templateId}`,
            method: "PATCH",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistViolationTemplateOutWeb>(request);

        return response.data;
    };

    public deleteTemplate = async (
        banlistId: number,
        templateId: number,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates/${templateId}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    public getEntries = async (
        banlistId: number,
        params?: BanlistEntriesQueryParams,
        options?: RequestOptions
    ): Promise<BanlistEntriesPage> => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/entries`,
            method: "GET",
            params,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistEntryOutWeb[]>(request);

        // общее число записей под фильтром — в заголовке; без него считаем длину тела
        const totalHeader = response.headers["x-total-count"];
        const total = totalHeader !== undefined ? Number(totalHeader) : response.data.length;

        return {
            entries: response.data,
            total: Number.isFinite(total) ? total : response.data.length,
        };
    };

    public getTemplateTags = async (banlistId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates/tags`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<string[]>(request);

        return response.data;
    };

    public createEntry = async (
        banlistId: number,
        data: BanlistEntryInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistEntryInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/entries`,
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistEntryOutWeb>(request);

        return response.data;
    };

    public createEntryFromTemplate = async (
        banlistId: number,
        templateId: number,
        data: BanlistEntryInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistEntryInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/entries/from-template/${templateId}`,
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistEntryOutWeb>(request);

        return response.data;
    };

    public getEntry = async (banlistId: number, entryId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/entries/${entryId}`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistEntryOutWeb>(request);

        return response.data;
    };

    public putEntry = async (
        banlistId: number,
        entryId: number,
        data: BanlistEntryPutInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistEntryPutInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/entries/${entryId}`,
            method: "PUT",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistEntryOutWeb>(request);

        return response.data;
    };

    public patchEntry = async (
        banlistId: number,
        entryId: number,
        data: BanlistEntryPatchInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistEntryPatchInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/entries/${entryId}`,
            method: "PATCH",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistEntryOutWeb>(request);

        return response.data;
    };

    public deleteEntry = async (banlistId: number, entryId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/entries/${entryId}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    public getSubject = async (
        banlistId: number,
        subjectId: number,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/subjects/${subjectId}`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistSubjectOutWeb>(request);

        return response.data;
    };

    public patchSubject = async (
        banlistId: number,
        subjectId: number,
        data: BanlistSubjectPatchInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistSubjectPatchInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/subjects/${subjectId}`,
            method: "PATCH",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistSubjectOutWeb>(request);

        return response.data;
    };

    public checkBan = async (
        banlistId: number,
        data: BanlistCheckRequestInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistCheckRequestInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/check`,
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistCheckResultOutWeb>(request);

        return response.data;
    };

    public incrementViolation = async (
        banlistId: number,
        templateId: number,
        data: BanlistIncrementRequestInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistIncrementRequestInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates/${templateId}/increment/violations`,
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistIncrementResultOutWeb>(request);

        return response.data;
    };

    // увеличивает счётчик завершённых игр субъекта (топливо для ленивого остывания нарушений)
    public incrementCompletedGames = async (
        banlistId: number,
        templateId: number,
        data: BanlistIncrementRequestInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistIncrementRequestInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates/${templateId}/increment/completed-games`,
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistViolationStatsOutWeb>(request);

        return response.data;
    };

    public getTemplateStats = async (
        banlistId: number,
        templateId: number,
        params?: BanlistViolationStatsQueryParams,
        options?: RequestOptions
    ): Promise<BanlistViolationStatsPage> => {
        // пустой/пробельный query не отправляем
        const trimmedQuery = params?.query?.trim();
        const requestParams = params
            ? { ...params, query: trimmedQuery ? trimmedQuery : undefined }
            : undefined;

        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates/${templateId}/stats`,
            method: "GET",
            params: requestParams,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistViolationStatsOutWeb[]>(request);

        // общее число записей под фильтром — в заголовке; без него считаем длину тела
        const totalHeader = response.headers["x-total-count"];
        const total = totalHeader !== undefined ? Number(totalHeader) : response.data.length;

        return {
            stats: response.data,
            total: Number.isFinite(total) ? total : response.data.length,
        };
    };

    public patchTemplateStats = async (
        banlistId: number,
        templateId: number,
        statsId: number,
        data: BanlistViolationStatsPatchInWeb,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<BanlistViolationStatsPatchInWeb> = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates/${templateId}/stats/${statsId}`,
            method: "PATCH",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<BanlistViolationStatsOutWeb>(request);

        return response.data;
    };

    // удаляет строку статистики субъекта — следующий инкремент создаст её заново с нуля
    public deleteTemplateStats = async (
        banlistId: number,
        templateId: number,
        statsId: number,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/banlists/${banlistId}/templates/${templateId}/stats/${statsId}`,
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
