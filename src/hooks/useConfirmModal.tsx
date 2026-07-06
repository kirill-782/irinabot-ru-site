import React, { useContext, useRef, useState } from "react";
import { Confirm } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../context";

// Настройки кнопки подтверждения — чтобы текст/цвет соответствовали действию
// (по умолчанию — красная «Удалить» для деструктивных операций).
export interface ConfirmOptions {
    confirmButton?: string;
    negative?: boolean;
}

export interface UseConfirmModalResult {
    confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
    confirmModal: React.ReactNode;
}

// Промис-обёртка над модалкой подтверждения — замена window.confirm.
// confirmModal нужно отрендерить в JSX компонента.
export const useConfirmModal = (): UseConfirmModalResult => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [message, setMessage] = useState<string | null>(null);
    const [options, setOptions] = useState<ConfirmOptions>({});
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = (text: string, opts: ConfirmOptions = {}) =>
        new Promise<boolean>((resolve) => {
            // незакрытый предыдущий вопрос считаем отклонённым
            resolveRef.current?.(false);
            resolveRef.current = resolve;
            setOptions(opts);
            setMessage(text);
        });

    const close = (value: boolean) => {
        setMessage(null);

        const resolve = resolveRef.current;
        resolveRef.current = null;
        resolve?.(value);
    };

    const negative = options.negative ?? true;
    const confirmModal = (
        <Confirm
            cancelButton={t("cancel")}
            confirmButton={{
                content: options.confirmButton ?? t("remove"),
                negative,
                primary: !negative,
            }}
            content={message ?? ""}
            onCancel={() => close(false)}
            onConfirm={() => close(true)}
            open={message !== null}
            size="mini"
        />
    );

    return { confirm, confirmModal };
};
