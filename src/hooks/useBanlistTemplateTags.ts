import { useCallback, useContext, useEffect, useState } from "react";
import { RestContext } from "../context";

interface UseBanlistTemplateTagsResult {
    // уникальные теги шаблонов банлиста (для дропдауна «Тег» в фильтрах записей)
    tags: string[];
    isLoading: boolean;
    reload: (signal?: AbortSignal) => Promise<void>;
}

export const useBanlistTemplateTags = (banlistId: number): UseBanlistTemplateTagsResult => {
    const { banlistApi } = useContext(RestContext);
    const [tags, setTags] = useState<string[]>([]);
    const [isLoading, setLoading] = useState(true);

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            if (!Number.isFinite(banlistId)) {
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const response = await banlistApi.getTemplateTags(banlistId, { signal });

                setTags(response);
            } catch (error) {
                if ((error as Error).message === "canceled") return;

                // дропдаун тегов необязателен — молча оставляем пустой список
                setTags([]);
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [banlistApi, banlistId]
    );

    useEffect(() => {
        const controller = new AbortController();

        void reload(controller.signal);

        return () => {
            controller.abort();
        };
    }, [reload]);

    return { tags, isLoading, reload };
};
