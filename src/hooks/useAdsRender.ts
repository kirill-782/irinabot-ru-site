import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/index";
import { AnonymousAccessMaskHolder } from "../utils/AccessMaskHolder";
import { currentTheme, E_THEME } from "../utils/Theme";

const renderAd = (adBlockId: string, contatinerId: string) => {
    // Ya.Context.AdvManager.render

    const Ya = (window as any).Ya as any;

    if (window.document.getElementById(contatinerId)) {
        (window as any).yaContextCb.push(() => {
            Ya.Context.AdvManager.render(
                {
                    blockId: adBlockId,
                    renderTo: contatinerId,
                    darkTheme: currentTheme === E_THEME.DARK,
                },
                () => {
                    window.document.getElementById(contatinerId)?.remove();
                }
            );
        });

        return true;
    }

    return false;
};

interface AdRenderOptions {
    removeContainer: boolean;
}

export const useAdsRender = (adBlockId: string, contatinerId: string, options?: AdRenderOptions) => {
    const [adsRenderComplete, setAdsRenderComplete] = useState(false);

    const { currentAuth, authCredentials, accessMask } = useContext(AuthContext).auth;

    useEffect(() => {
        if (adsRenderComplete) return;

        // Wait auth ready
        if (authCredentials && accessMask instanceof AnonymousAccessMaskHolder) return;

        if (currentAuth) {
            if (accessMask.hasAccess(1, currentAuth.connectorId) || accessMask.hasAccess(32, currentAuth.connectorId)) {
                setAdsRenderComplete(true);

                if (options?.removeContainer) {
                    setTimeout(() => {
                        window.document.getElementById(contatinerId)?.remove();
                    }, 100);
                }

                return;
            }
        }

        let adRenderTimer;

        const adTryRender = () => {
            if (!renderAd(adBlockId, contatinerId)) {
                adRenderTimer = setTimeout(adTryRender, 100);
            }
        };

        adRenderTimer = setTimeout(adTryRender, 100);

        return () => {
            clearTimeout(adRenderTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [adsRenderComplete, currentAuth, authCredentials, accessMask];
};
