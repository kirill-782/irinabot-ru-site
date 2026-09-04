import React, { useContext } from "react";
import { Image } from "semantic-ui-react";
import classnames from "classnames";
import { RestContext } from "../../context";
import { BannerDto } from "../../models/rest/Banner";

interface BannerViewProps {
    banner: BannerDto;
    className?: string;
}

// Один баннер: картинка-ссылка. Переход идёт через /v1/banners/{id}/click —
// сервер считает клик и редиректит на targetUrl.
function BannerView({ banner, className }: BannerViewProps) {
    const { wikiApi } = useContext(RestContext);

    const imageUrl = banner.imageUrl
        ? wikiApi.resolveApiUrl(banner.imageUrl)
        : wikiApi.getBannerImageUrl(banner.id);

    const clickUrl = banner.clickUrl
        ? wikiApi.resolveApiUrl(banner.clickUrl)
        : wikiApi.getBannerClickUrl(banner.id);

    return (
        <a href={clickUrl} className={classnames("gachi", className)} title={banner.title}>
            <Image src={imageUrl} alt={banner.title || ""} />
        </a>
    );
}

export default BannerView;
