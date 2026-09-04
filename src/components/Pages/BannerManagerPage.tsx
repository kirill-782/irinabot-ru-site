import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Header, Image, Label, Loader, Message, Table } from "semantic-ui-react";
import { RestContext } from "../../context";
import {
    BANNER_PLACEMENT_TITLES,
    BannerAdminDto,
    BannerRequest,
} from "../../models/rest/Banner";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import { formatAdminListDateValue } from "../../utils/AdminListUtils";
import { runWithToast } from "../../utils/ToastUtils";
import { useConfirmModal } from "../../hooks/useConfirmModal";
import { useWikiAccess } from "../../utils/useWikiAccess";
import { useTitle } from "../../hooks/useTitle";
import BannerEditModal from "../Banner/BannerEditModal";
import BannerStatsModal from "../Banner/BannerStatsModal";

// PUT /v1/banners/{id} заменяет баннер целиком, поэтому для точечных правок
// (напр. переключателя «включён») тело собираем из текущего состояния.
const toRequest = (banner: BannerAdminDto): BannerRequest => ({
    placement: banner.placement,
    title: banner.title,
    targetUrl: banner.targetUrl,
    creatorId: banner.creatorId,
    index: banner.index,
    weight: banner.weight,
    priority: banner.priority,
    enabled: banner.enabled,
    startsAt: banner.startsAt,
    expiresAt: banner.expiresAt,
});

interface BannerStatus {
    text: string;
    color?: "green" | "grey" | "orange" | "red";
}

const getStatus = (banner: BannerAdminDto): BannerStatus => {
    if (banner.enabled === false) return { text: "Выключен", color: "grey" };

    const now = Date.now();

    if (banner.expiresAt && new Date(banner.expiresAt).getTime() <= now) {
        return { text: "Просрочен", color: "red" };
    }

    if (banner.startsAt && new Date(banner.startsAt).getTime() > now) {
        return { text: "Запланирован", color: "orange" };
    }

    return { text: "Активен", color: "green" };
};

const formatPeriod = (banner: BannerAdminDto) => {
    if (!banner.startsAt && !banner.expiresAt) return "бессрочно";

    const from = banner.startsAt ? formatAdminListDateValue(banner.startsAt) : "…";
    const to = banner.expiresAt ? formatAdminListDateValue(banner.expiresAt) : "…";

    return `${from} — ${to}`;
};

// Где именно баннер встраивается в список игр.
const formatTarget = (banner: BannerAdminDto) => {
    const parts: string[] = [];

    if (banner.index !== undefined && banner.index !== null) parts.push(`строка ${banner.index}`);
    if (banner.creatorId !== undefined && banner.creatorId !== null) parts.push(`хост ${banner.creatorId}`);

    return parts.length > 0 ? parts.join(", ") : "—";
};

function BannerManagerPage() {
    const { wikiApi } = useContext(RestContext);
    const { isBannerAdmin } = useWikiAccess();
    const { confirm, confirmModal } = useConfirmModal();

    const [banners, setBanners] = useState<BannerAdminDto[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editedBanner, setEditedBanner] = useState<BannerAdminDto | null>(null);
    const [statsBanner, setStatsBanner] = useState<BannerAdminDto | null>(null);

    useTitle("Баннеры");

    const load = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await wikiApi.getBannersForManagement({ signal });

                if (signal?.aborted) return;

                setBanners(response);
            } catch (error) {
                if (signal?.aborted) return;

                setErrorMessage(convertErrorResponseToString(error));
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [wikiApi]
    );

    useEffect(() => {
        if (!isBannerAdmin) return;

        const controller = new AbortController();

        void load(controller.signal);

        return () => controller.abort();
    }, [load, isBannerAdmin]);

    // Порядок как на сайте: сначала место показа, внутри — позиция в списке.
    const sortedBanners = useMemo(() => {
        return [...banners].sort((a, b) => {
            if (a.placement !== b.placement) return a.placement.localeCompare(b.placement);

            return (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER);
        });
    }, [banners]);

    const upsertBanner = (banner: BannerAdminDto) => {
        setBanners((prev) => {
            const index = prev.findIndex((item) => item.id === banner.id);

            if (index === -1) return [...prev, banner];

            const next = [...prev];
            next[index] = banner;

            return next;
        });
    };

    const openCreate = () => {
        setEditedBanner(null);
        setEditorOpen(true);
    };

    const openEdit = (banner: BannerAdminDto) => {
        setEditedBanner(banner);
        setEditorOpen(true);
    };

    const toggleEnabled = async (banner: BannerAdminDto) => {
        setBusyId(banner.id);

        const result = await runWithToast(
            () => wikiApi.replaceBanner(banner.id, { ...toRequest(banner), enabled: banner.enabled === false }),
            { error: "Не удалось изменить баннер" }
        );

        setBusyId(null);

        if (result.ok) upsertBanner(result.value);
    };

    const remove = async (banner: BannerAdminDto) => {
        const confirmed = await confirm(
            `Удалить баннер «${banner.title || banner.targetUrl}»? Действие необратимо.`,
            { confirmButton: "Удалить" }
        );

        if (!confirmed) return;

        setBusyId(banner.id);

        const result = await runWithToast(() => wikiApi.deleteBanner(banner.id), {
            success: "Баннер удалён",
            error: "Не удалось удалить баннер",
        });

        setBusyId(null);

        if (result.ok) setBanners((prev) => prev.filter((item) => item.id !== banner.id));
    };

    if (!isBannerAdmin) {
        return (
            <div>
                <Header>
                    Баннеры
                    <Header.Subheader>
                        Реклама и промо-блоки сайта (<code>/v1/banners</code>).
                    </Header.Subheader>
                </Header>
                <Message
                    error
                    icon="lock"
                    header="Недостаточно прав"
                    content="Для управления баннерами нужна роль администратора баннеров (по умолчанию WIKI_ADMIN)."
                />
            </div>
        );
    }

    return (
        <div className="banner-manager">
            <Header>
                Баннеры
                <Header.Subheader>
                    Промо-блоки в списке игр (<code>/v1/banners</code>). Сервер сам отбирает баннеры по
                    периоду показа и весу ротации; владельцам VIP показываются только приоритетные.
                </Header.Subheader>
            </Header>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "0.75em",
                    margin: "1em 0",
                }}
            >
                <Button primary icon="plus" content="Создать баннер" onClick={openCreate} />
                <Button basic icon="refresh" content="Обновить" disabled={isLoading} onClick={() => load()} />
            </div>

            {errorMessage && <Message error content={errorMessage} />}

            {isLoading ? (
                <Loader active inline="centered" content="Загрузка баннеров…" />
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <Table celled compact>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Картинка</Table.HeaderCell>
                                <Table.HeaderCell>Баннер</Table.HeaderCell>
                                <Table.HeaderCell>Показ</Table.HeaderCell>
                                <Table.HeaderCell>Период</Table.HeaderCell>
                                <Table.HeaderCell>Статус</Table.HeaderCell>
                                <Table.HeaderCell>Клики</Table.HeaderCell>
                                <Table.HeaderCell />
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {sortedBanners.length === 0 && (
                                <Table.Row>
                                    <Table.Cell colSpan={7} disabled textAlign="center">
                                        Баннеров пока нет
                                    </Table.Cell>
                                </Table.Row>
                            )}
                            {sortedBanners.map((banner) => {
                                const status = getStatus(banner);
                                const busy = busyId === banner.id;

                                return (
                                    <Table.Row key={banner.id} disabled={busy}>
                                        <Table.Cell>
                                            {banner.hasImage ? (
                                                <Image
                                                    // метка версии — иначе после замены картинки
                                                    // браузер отдаст закешированную по ETag
                                                    src={`${wikiApi.getBannerImageUrl(banner.id)}?v=${encodeURIComponent(
                                                        banner.updatedAt ?? ""
                                                    )}`}
                                                    alt={banner.title || ""}
                                                    style={{ maxHeight: 48, maxWidth: 200 }}
                                                />
                                            ) : (
                                                <Label basic color="red" size="tiny" content="нет картинки" />
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div>
                                                <strong>{banner.title || "без названия"}</strong>
                                            </div>
                                            <div>
                                                <a href={banner.targetUrl} target="_blank" rel="noreferrer">
                                                    {banner.targetUrl}
                                                </a>
                                            </div>
                                            <Label basic size="tiny" horizontal>
                                                {BANNER_PLACEMENT_TITLES[banner.placement] ?? banner.placement}
                                            </Label>
                                            {banner.priority && (
                                                <Label color="teal" size="tiny" horizontal content="приоритет" />
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div>{formatTarget(banner)}</div>
                                            <div>вес: {banner.weight ?? 1}</div>
                                        </Table.Cell>
                                        <Table.Cell>{formatPeriod(banner)}</Table.Cell>
                                        <Table.Cell>
                                            {/* Label и Checkbox — инлайновые, поэтому колонку
                                                собираем явной колонкой, иначе они встают в строку */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "flex-start",
                                                    gap: "0.5em",
                                                }}
                                            >
                                                <Label color={status.color} size="tiny" content={status.text} />
                                                <Checkbox
                                                    toggle
                                                    checked={banner.enabled !== false}
                                                    disabled={busy}
                                                    onChange={() => toggleEnabled(banner)}
                                                />
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>{banner.clickCount ?? 0}</Table.Cell>
                                        <Table.Cell>
                                            <Button
                                                basic
                                                icon="edit"
                                                size="tiny"
                                                title="Редактировать"
                                                disabled={busy}
                                                onClick={() => openEdit(banner)}
                                            />
                                            <Button
                                                basic
                                                icon="chart bar"
                                                size="tiny"
                                                title="Статистика кликов"
                                                disabled={busy}
                                                onClick={() => setStatsBanner(banner)}
                                            />
                                            <Button
                                                basic
                                                color="red"
                                                icon="trash"
                                                size="tiny"
                                                title="Удалить"
                                                disabled={busy}
                                                onClick={() => remove(banner)}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>
                </div>
            )}

            <BannerEditModal
                open={editorOpen}
                banner={editedBanner}
                onClose={() => setEditorOpen(false)}
                onSaved={upsertBanner}
            />
            <BannerStatsModal
                open={statsBanner !== null}
                banner={statsBanner}
                onClose={() => setStatsBanner(null)}
            />
            {confirmModal}
        </div>
    );
}

export default BannerManagerPage;
