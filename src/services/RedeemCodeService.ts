import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { RedeemRequest } from "../models/rest/RedeemRequest";
import { RedeemResponse } from "../models/rest/RedeemResponse";
import { RedeemResult } from "../models/rest/RedeemResult";
import { RequestOptions } from "./MapService";

export class RedeemCodeService {
    public defaultConfig: AxiosRequestConfig;

    constructor(defaultConfig?: AxiosRequestConfig) {
        this.defaultConfig = defaultConfig || {};
    }

    public redeemCode = async (redeemRequest: RedeemRequest, options?: RequestOptions): Promise<RedeemResult> => {
        let request: AxiosRequestConfig<RedeemRequest> = {
            ...this.defaultConfig,
            url: "/v1/redeem",
            method: "POST",
            headers: {
                ...this.defaultConfig.headers,
                "content-type": "application/json",
            },
            data: redeemRequest,
            validateStatus: () => true,
        };

        request = this.appendOptions(request, options);

        const response = await Axios.request<RedeemResponse | string>(request);

        switch (response.status) {
            case 200: {
                const amount = this.getAmount(response.data);

                if (amount === null) throw new Error("Redeem API returned invalid amount");

                return {
                    ok: true,
                    statusCode: 200,
                    amount,
                };
            }
            case 409:
                return {
                    ok: false,
                    statusCode: 409,
                    reason: "code_not_found_or_activated",
                };
            case 429:
                return {
                    ok: false,
                    statusCode: 429,
                    reason: "redeem_too_fast",
                };
            default:
                return {
                    ok: false,
                    statusCode: response.status,
                    reason: "error",
                    message: this.getTextResponse(response),
                };
        }
    };

    private appendOptions(request: AxiosRequestConfig, options?: RequestOptions) {
        if (!options) return request;

        request.onUploadProgress = options.onUploadProgress;
        request.onDownloadProgress = options.onDownloadProgress;
        request.signal = options.signal;

        return request;
    }

    private getAmount(data: RedeemResponse | string) {
        if (typeof data === "string") {
            try {
                const parsedData = JSON.parse(data) as RedeemResponse;

                return typeof parsedData.amount === "number" ? parsedData.amount : null;
            } catch (error) {
                return null;
            }
        }

        return typeof data?.amount === "number" ? data.amount : null;
    }

    private getTextResponse(response: AxiosResponse<RedeemResponse | string>) {
        if (typeof response.data === "string" && response.data.trim().length > 0) return response.data;

        if (response.data && typeof response.data === "object") {
            try {
                return JSON.stringify(response.data);
            } catch (error) {}
        }

        return `Server status ${response.status}`;
    }
}
