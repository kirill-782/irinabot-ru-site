import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext, RestContext } from "../context";
import { BannerDto, BannerPlacement } from "../models/rest/Banner";
import { AccessMaskBit } from "../components/Modal/AccessMaskModal";

interface UseBannersResult {
    banners: BannerDto[];
    isLoading: boolean;
    reload: (signal?: AbortSignal) => Promise<void>;
}

// Баннеры сайта для места показа. Раньше список был захардкожен в GameList (ADS),
// теперь приходит с сервера (/v1/banners): сервер сам отбирает включённые баннеры
// с учётом периода показа и веса ротации.
//
// Владельцам VIP реклама не показывается — кроме баннеров с priority (наши
// собственные каналы: телеграм, ютуб и т.п.).
//
// Ошибки намеренно проглатываются: недоступный баннерный API не должен ломать
// список игр — просто не будет баннеров.
export const useBanners = (placement: BannerPlacement): UseBannersResult => {
    const { wikiApi } = useContext(RestContext);
    const { accessMask } = useContext(AuthContext).auth;

    const [banners, setBanners] = useState<BannerDto[]>([]);
    const [isLoading, setLoading] = useState(true);

    const reload = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);

            try {
                const response = await wikiApi.getBanners(placement, { signal });

                if (signal?.aborted) return;

                setBanners(response);
            } catch (error) {
                if (signal?.aborted) return;

                setBanners([]);
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [wikiApi, placement]
    );

    useEffect(() => {
        const controller = new AbortController();

        void reload(controller.signal);

        return () => {
            controller.abort();
        };
    }, [reload]);

    const hasVip = accessMask.hasAccess(AccessMaskBit.VIP_COMMANDS);

    const visibleBanners = useMemo(() => {
        if (!hasVip) return banners;

        return banners.filter((banner) => banner.priority);
    }, [banners, hasVip]);

    return { banners: visibleBanners, isLoading, reload };
};
