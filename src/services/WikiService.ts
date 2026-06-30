import Axios, { AxiosRequestConfig } from "axios";
import {
    AclEntryDto,
    ArticleDto,
    ArticleNodeDto,
    BatchFileRequest,
    CreateArticleRequest,
    CreateTokenRequest,
    CreateWikiRequest,
    FileDto,
    FileLinkDto,
    MoveArticleRequest,
    ReorderArticlesRequest,
    RevisionDto,
    SavePayloadRequest,
    UpdateArticleRequest,
    SetAclRoleRequest,
    UpdateVisibilityRequest,
    WikiDto,
    WikiLangMap,
    WikiTokenDto,
    WikiTokenSecretDto,
} from "../models/rest/Wiki";
import { RequestOptions } from "./MapService";

// Обёртка над кастомными контроллерами Wiki API (/v1/* из openapi.yaml v0.2.0).
// Токен и базовый URL приходят через defaultConfig (см. WikiApiConfig).
export class WikiService {
    public defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    // ---------- Чтение статей (публичное; ранее жило прямо в WikiPage) ----------

    // Корневые статьи вики (дерево бокового меню).
    public getWikiArticles = async (
        wikiUrl: string,
        locale: string,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/articles`,
            method: "GET",
            params: { locale },
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<ArticleNodeDto[]>(request);

        return response.data;
    };

    // Статья с контентом по её url внутри вики.
    public getArticleByUrl = async (
        wikiUrl: string,
        articleUrl: string,
        locale: string,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/article/${encodeURIComponent(articleUrl)}`,
            method: "GET",
            params: { locale },
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<ArticleDto>(request);

        return response.data;
    };

    // Статья с контентом по числовому id.
    public getArticleById = async (articleId: number, locale: string, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/article/${articleId}`,
            method: "GET",
            params: { locale },
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<ArticleDto>(request);

        return response.data;
    };

    // Дочерние статьи (узлы дерева) для статьи.
    public getArticleChildren = async (
        articleId: number,
        locale: string,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/article/${articleId}/articles`,
            method: "GET",
            params: { locale },
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<ArticleNodeDto[]>(request);

        return response.data;
    };

    // Соседние статьи (того же родителя).
    public getArticleSiblings = async (
        articleId: number,
        locale: string,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/article/${articleId}/sibling`,
            method: "GET",
            params: { locale },
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<ArticleNodeDto[]>(request);

        return response.data;
    };

    // ---------- История ревизий контента ----------

    public getRevisions = async (
        articleId: number,
        locale: string,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/article/${articleId}/payload/${encodeURIComponent(locale)}/revisions`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<RevisionDto[]>(request);

        return response.data;
    };

    public getRevision = async (
        articleId: number,
        locale: string,
        version: number,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/article/${articleId}/payload/${encodeURIComponent(locale)}/revisions/${version}`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<RevisionDto>(request);

        return response.data;
    };

    // ---------- Управление вики (для админа системы, WIKI_ADMIN) ----------

    // Список всех вики.
    public listWikis = async (options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/wiki",
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<WikiDto[]>(request);

        return response.data;
    };

    // Одна вики по url.
    public getWiki = async (wikiUrl: string, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<WikiDto>(request);

        return response.data;
    };

    public createWiki = async (data: CreateWikiRequest, options?: RequestOptions) => {
        let request: AxiosRequestConfig<CreateWikiRequest> = {
            ...this.defaultConfig,
            url: "/v1/wiki",
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<WikiDto>(request);

        return response.data;
    };

    public setWikiVisibility = async (
        wikiUrl: string,
        data: UpdateVisibilityRequest,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<UpdateVisibilityRequest> = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/visibility`,
            method: "PATCH",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<WikiDto>(request);

        return response.data;
    };

    // ---------- Управление статьями ----------

    // Создать статью (узел). Контент задаётся отдельно через saveArticlePayload.
    public createArticle = async (
        wikiUrl: string,
        data: CreateArticleRequest,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<CreateArticleRequest> = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/article`,
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<ArticleNodeDto>(request);

        return response.data;
    };

    // Сохранить/обновить контент статьи для локали (создаёт новую ревизию).
    public saveArticlePayload = async (
        articleId: number,
        data: SavePayloadRequest,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<SavePayloadRequest> = {
            ...this.defaultConfig,
            url: `/v1/article/${articleId}/payload`,
            method: "PUT",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<ArticleDto>(request);

        return response.data;
    };

    // Перенести статью к другому родителю. parentId не задан → в корень.
    public moveArticle = async (
        articleId: number,
        parentId?: number,
        options?: RequestOptions
    ) => {
        const data: MoveArticleRequest = { parentId };

        let request: AxiosRequestConfig<MoveArticleRequest> = {
            ...this.defaultConfig,
            url: `/v1/article/${articleId}/parent`,
            method: "PATCH",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<ArticleNodeDto>(request);

        return response.data;
    };

    // Новый порядок соседних статей (orderedIds — id соседей в нужном порядке).
    public reorderArticles = async (
        wikiUrl: string,
        orderedIds: number[],
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<ReorderArticlesRequest> = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/articles/order`,
            method: "PUT",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data: { orderedIds },
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    // Свойства статьи: скрытая/заблокированная (уровень статьи). Возвращает узел.
    public updateArticle = async (
        articleId: number,
        data: UpdateArticleRequest,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<UpdateArticleRequest> = {
            ...this.defaultConfig,
            url: `/v1/article/${articleId}`,
            method: "PATCH",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<ArticleNodeDto>(request);

        return response.data;
    };

    // ---------- ACL (доступы к вики) ----------

    public getWikiAcl = async (wikiUrl: string, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/acl`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<AclEntryDto[]>(request);

        return response.data;
    };

    public setWikiAclRole = async (
        wikiUrl: string,
        userId: string,
        data: SetAclRoleRequest,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<SetAclRoleRequest> = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/acl/${encodeURIComponent(userId)}`,
            method: "PUT",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<AclEntryDto>(request);

        return response.data;
    };

    public removeWikiAcl = async (wikiUrl: string, userId: string, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/acl/${encodeURIComponent(userId)}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    // ---------- Токены вики (для автоматизации, Authorization: Bot <uuid>) ----------

    public getWikiTokens = async (wikiUrl: string, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/tokens`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<WikiTokenDto[]>(request);

        return response.data;
    };

    // Создаёт токен; секрет (uuid) возвращается единожды — сохраните его сразу.
    public createWikiToken = async (
        wikiUrl: string,
        data: CreateTokenRequest,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<CreateTokenRequest> = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/tokens`,
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<WikiTokenSecretDto>(request);

        return response.data;
    };

    public revokeWikiToken = async (wikiUrl: string, id: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/tokens/${id}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    // ---------- Файлы (S3) ----------

    // Пакетный запрос прямых ссылок на файлы по их id (одним запросом вместо
    // редиректа на каждый файл). Возвращает только доступные файлы.
    public getFileLinks = async (ids: string[], options?: RequestOptions) => {
        let request: AxiosRequestConfig<BatchFileRequest> = {
            ...this.defaultConfig,
            url: "/v1/files/batch",
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data: { ids },
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<FileLinkDto[]>(request);

        return response.data;
    };

    public getWikiFiles = async (wikiUrl: string, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/files`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<FileDto[]>(request);

        return response.data;
    };

    // Файлы, прикреплённые к статье.
    public getArticleFiles = async (articleId: number, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/article/${articleId}/files`,
            method: "GET",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<FileDto[]>(request);

        return response.data;
    };

    // Загрузка файла/картинки. articleId опционально привязывает файл к статье.
    public uploadWikiFile = async (
        wikiUrl: string,
        file: File,
        articleId?: number,
        options?: RequestOptions
    ) => {
        const body = new FormData();
        body.append("file", file);

        // content-type для multipart (с boundary) выставит браузер сам; в defaultConfig
        // его нет — там только Authorization, поэтому заголовки передаём как есть.
        let request: AxiosRequestConfig<FormData> = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/files`,
            method: "POST",
            params: articleId !== undefined ? { articleId } : undefined,
            data: body,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<FileDto>(request);

        return response.data;
    };

    public deleteWikiFile = async (wikiUrl: string, id: string, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: `/v1/wiki/${encodeURIComponent(wikiUrl)}/files/${encodeURIComponent(id)}`,
            method: "DELETE",
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<void>(request);

        return response.data;
    };

    // Прямая ссылка на скачивание файла — удобно для <img src> / <a href>.
    public getFileUrl = (id: string) => {
        const base = this.defaultConfig.baseURL ?? "";
        return `${base}${base.endsWith("/") ? "" : "/"}v1/files/${encodeURIComponent(id)}`;
    };

    // ---------- i18n (словарь сайта) ----------

    public getLang = async (locale: string, options?: RequestOptions) => {
        let request: AxiosRequestConfig = {
            ...this.defaultConfig,
            url: "/v1/lang",
            method: "GET",
            params: { locale },
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<WikiLangMap>(request);

        return response.data;
    };

    // Частичное обновление словаря локали (требует WIKI_LANG_ADMIN).
    public patchLang = async (
        locale: string,
        entries: WikiLangMap,
        options?: RequestOptions
    ) => {
        let request: AxiosRequestConfig<WikiLangMap> = {
            ...this.defaultConfig,
            url: "/v1/lang",
            method: "PATCH",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            params: { locale },
            data: entries,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<WikiLangMap>(request);

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
