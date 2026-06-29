import { ReactNode, useCallback, useState } from "react";
import { runWithToast } from "../utils/ToastUtils";
import { useConfirmModal } from "./useConfirmModal";

export interface ConfirmActionOptions {
    // если задано — сначала спрашиваем подтверждение с этим текстом
    confirm?: string;
    success?: string;
    error: string;
    // вызывается после успешного действия (обычно перезагрузка списка)
    onSuccess?: () => Promise<void> | void;
}

export interface UseConfirmActionResult<K> {
    // ключ строки, для которой сейчас выполняется действие (индикатор загрузки)
    busyId: K | null;
    run: (
        id: K,
        action: () => Promise<unknown>,
        options: ConfirmActionOptions
    ) => Promise<void>;
    confirmModal: ReactNode;
}

// Типовое действие над строкой: (опц.) подтверждение → busy-индикатор → тост →
// перезагрузка. Заменяет повторяющийся boilerplate удаления/сброса/переключения.
export const useConfirmAction = <K = number>(): UseConfirmActionResult<K> => {
    const { confirm, confirmModal } = useConfirmModal();
    const [busyId, setBusyId] = useState<K | null>(null);

    const run = useCallback(
        async (id: K, action: () => Promise<unknown>, options: ConfirmActionOptions) => {
            if (options.confirm && !(await confirm(options.confirm))) return;

            setBusyId(id);

            const result = await runWithToast(action, {
                success: options.success,
                error: options.error,
            });
            if (result.ok) await options.onSuccess?.();

            setBusyId(null);
        },
        [confirm]
    );

    return { busyId, run, confirmModal };
};
