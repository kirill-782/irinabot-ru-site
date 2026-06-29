import { toast } from "@kokomi/react-semantic-toasts";
import { convertErrorResponseToString } from "./ApiUtils";

export type RunWithToastResult<T> = { ok: true; value: T } | { ok: false };

export interface RunWithToastOptions {
    success?: string;
    error: string;
}

// Общий шаблон мутации: тост об успехе (если задан) и тост ошибки
// с расшифровкой ответа сервера.
export const runWithToast = async <T>(
    fn: () => Promise<T>,
    options: RunWithToastOptions
): Promise<RunWithToastResult<T>> => {
    try {
        const value = await fn();

        if (options.success) {
            toast({ title: options.success, type: "success" });
        }

        return { ok: true, value };
    } catch (error) {
        toast({
            title: options.error,
            description: convertErrorResponseToString(error),
            type: "error",
            time: 10000,
        });

        return { ok: false };
    }
};
