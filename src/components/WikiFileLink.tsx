import React, { useContext, useEffect, useState } from "react";
import { Icon } from "semantic-ui-react";
import { AppRuntimeSettingsContext, RestContext } from "../context";
import { FileLinkDto } from "../models/rest/Wiki";
import { absolutize, formatFileSize, loadFileLink, redirectUrl } from "./WikiFileImage";

// Ссылка-указатель на файл: [@](file(uuid)) → ссылка на скачивание с именем и размером
// (по аналогии с указателями на карты). Ссылка резолвится тем же пакетным загрузчиком.

interface WikiFileLinkProps {
    id: string;
}

function WikiFileLink({ id }: WikiFileLinkProps) {
    const { wikiApi } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;
    const [dto, setDto] = useState<FileLinkDto | null | undefined>(undefined);

    useEffect(() => {
        let alive = true;
        loadFileLink(id, wikiApi).then((d) => alive && setDto(d));
        return () => {
            alive = false;
        };
    }, [id, wikiApi]);

    if (dto === undefined) return <span>…</span>;

    const href = dto ? absolutize(dto.url) : redirectUrl(id);
    const name = dto?.name || t("wikiFileLinkDefaultName");
    const size = dto ? formatFileSize(dto.size) : "";

    return (
        <a href={href} target="_blank" rel="noreferrer">
            <Icon name="file outline" />
            {name}
            {size ? ` (${size})` : ""}
        </a>
    );
}

export default WikiFileLink;
