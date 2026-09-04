import React from "react";
import { useBanners } from "../../hooks/useBanners";
import { BannerPlacement } from "../../models/rest/Banner";
import BannerView from "./BannerView";

interface BannerPlacementBlockProps {
    placement: BannerPlacement;
    className?: string;
    style?: React.CSSProperties;
}

// Блок баннеров для места показа, не встроенного в таблицу (напр. ABOVE_GAME_LIST).
// Если баннеров нет — не рендерит ничего, чтобы не занимать место отступами.
function BannerPlacementBlock({ placement, className, style }: BannerPlacementBlockProps) {
    const { banners } = useBanners(placement);

    if (banners.length === 0) return null;

    return (
        <div className={className} style={style}>
            {banners.map((banner) => (
                <BannerView key={banner.id} banner={banner} />
            ))}
        </div>
    );
}

export default BannerPlacementBlock;
