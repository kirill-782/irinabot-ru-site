import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, Header, Loader, Message, Modal, Table } from "semantic-ui-react";
import { RestContext } from "../../context";
import { BannerAdminDto, BannerClickStatDto } from "../../models/rest/Banner";
import { convertErrorResponseToString } from "../../utils/ApiUtils";

interface BannerStatsModalProps {
    open: boolean;
    banner: BannerAdminDto | null;
    onClose: () => void;
}

const DAY_OPTIONS = [7, 30, 90];

// Клики по дням (GET /v1/banners/{id}/stats). Дни без кликов сервер не возвращает —
// показываем только те, что пришли.
function BannerStatsModal({ open, banner, onClose }: BannerStatsModalProps) {
    const { wikiApi } = useContext(RestContext);

    const [days, setDays] = useState(30);
    const [stats, setStats] = useState<BannerClickStatDto[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const bannerId = banner?.id;

    const load = useCallback(
        async (signal?: AbortSignal) => {
            if (!bannerId) return;

            setLoading(true);
            setErrorMessage("");

            try {
                const response = await wikiApi.getBannerStats(bannerId, days, { signal });

                if (signal?.aborted) return;

                setStats(response);
            } catch (error) {
                if (signal?.aborted) return;

                setErrorMessage(convertErrorResponseToString(error));
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [wikiApi, bannerId, days]
    );

    useEffect(() => {
        if (!open || !bannerId) return;

        const controller = new AbortController();

        void load(controller.signal);

        return () => controller.abort();
    }, [open, bannerId, load]);

    const total = stats.reduce((sum, stat) => sum + stat.clicks, 0);
    const max = stats.reduce((peak, stat) => Math.max(peak, stat.clicks), 0);

    return (
        <Modal open={open} onClose={onClose} closeIcon size="small">
            <Modal.Header>Статистика кликов</Modal.Header>
            <Modal.Content scrolling>
                <Header as="h4">
                    {banner?.title || banner?.targetUrl}
                    <Header.Subheader>
                        Всего за период: {total} · всего за всё время: {banner?.clickCount ?? 0}
                    </Header.Subheader>
                </Header>

                <Button.Group size="tiny" style={{ marginBottom: "1em" }}>
                    {DAY_OPTIONS.map((option) => (
                        <Button
                            key={option}
                            primary={option === days}
                            content={`${option} дн.`}
                            onClick={() => setDays(option)}
                        />
                    ))}
                </Button.Group>

                {errorMessage && <Message error content={errorMessage} />}

                {isLoading ? (
                    <Loader active inline="centered" content="Загрузка статистики…" />
                ) : (
                    <Table compact celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell width={4}>Дата</Table.HeaderCell>
                                <Table.HeaderCell width={2}>Клики</Table.HeaderCell>
                                <Table.HeaderCell />
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {stats.length === 0 && (
                                <Table.Row>
                                    <Table.Cell colSpan={3} disabled textAlign="center">
                                        Кликов за период нет
                                    </Table.Cell>
                                </Table.Row>
                            )}
                            {stats.map((stat) => (
                                <Table.Row key={stat.day}>
                                    <Table.Cell>{stat.day}</Table.Cell>
                                    <Table.Cell>{stat.clicks}</Table.Cell>
                                    <Table.Cell>
                                        <div
                                            style={{
                                                height: 8,
                                                borderRadius: 4,
                                                background: "#2185d0",
                                                width: max > 0 ? `${(stat.clicks / max) * 100}%` : 0,
                                            }}
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                )}
            </Modal.Content>
            <Modal.Actions>
                <Button content="Закрыть" onClick={onClose} />
            </Modal.Actions>
        </Modal>
    );
}

export default BannerStatsModal;
