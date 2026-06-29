import React, { useContext, useRef, useState } from "react";
import { Confirm } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../context";

export interface UseConfirmModalResult {
    confirm: (message: string) => Promise<boolean>;
    confirmModal: React.ReactNode;
}

// Промис-обёртка над модалкой подтверждения — замена window.confirm.
// confirmModal нужно отрендерить в JSX компонента.
export const useConfirmModal = (): UseConfirmModalResult => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [message, setMessage] = useState<string | null>(null);
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = (text: string) =>
        new Promise<boolean>((resolve) => {
            // незакрытый предыдущий вопрос считаем отклонённым
            resolveRef.current?.(false);
            resolveRef.current = resolve;
            setMessage(text);
        });

    const close = (value: boolean) => {
        setMessage(null);

        const resolve = resolveRef.current;
        resolveRef.current = null;
        resolve?.(value);
    };

    const confirmModal = (
        <Confirm
            cancelButton={t("cancel")}
            confirmButton={{ content: t("remove"), negative: true, primary: false }}
            content={message ?? ""}
            onCancel={() => close(false)}
            onConfirm={() => close(true)}
            open={message !== null}
            size="mini"
        />
    );

    return { confirm, confirmModal };
};
