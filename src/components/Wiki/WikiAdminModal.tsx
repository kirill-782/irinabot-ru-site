import React, { useCallback, useEffect, useState } from "react";
import { Button, Dropdown, Form, Header, Label, Loader, Message, Modal, Table } from "semantic-ui-react";
import { WikiDto, WikiVisibility } from "../../models/rest/Wiki";
import { WikiService } from "../../services/WikiService";

interface WikiAdminModalProps {
    open: boolean;
    api: WikiService;
    currentWiki?: string;
    onClose: () => void;
    onNavigate: (wikiUrl: string) => void;
}

const visibilityOptions = [
    { key: "PUBLIC", value: "PUBLIC", text: "Публичная" },
    { key: "PRIVATE", value: "PRIVATE", text: "Приватная" },
];

function WikiAdminModal({ open, api, currentWiki, onClose, onNavigate }: WikiAdminModalProps) {
    const [wikis, setWikis] = useState<WikiDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [newUrl, setNewUrl] = useState("");
    const [newVisibility, setNewVisibility] = useState<WikiVisibility>("PUBLIC");
    const [newOwner, setNewOwner] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setWikis(await api.listWikis());
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Не удалось загрузить список вики");
        }
        setLoading(false);
    }, [api]);

    useEffect(() => {
        if (open) {
            setNewUrl("");
            setNewVisibility("PUBLIC");
            setNewOwner("");
            load();
        }
    }, [open, load]);

    const setVisibility = async (wikiUrl: string, visibility: WikiVisibility) => {
        setBusy(true);
        setError(null);
        try {
            await api.setWikiVisibility(wikiUrl, { visibility });
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Не удалось изменить видимость");
        }
        setBusy(false);
    };

    const goto = (wikiUrl: string) => {
        onNavigate(wikiUrl);
        onClose();
    };

    const create = async () => {
        const url = newUrl.trim();
        if (!url) return;
        setBusy(true);
        setError(null);
        try {
            const created = await api.createWiki({
                url,
                visibility: newVisibility,
                owner: newOwner.trim() || undefined,
            });
            goto(created.url);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Не удалось создать вики");
            setBusy(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} size="small" closeIcon>
            <Modal.Header>Управление вики</Modal.Header>
            <Modal.Content>
                {error && <Message error content={error} />}

                {loading ? (
                    <Loader active inline="centered" />
                ) : (
                    <Table basic="very" compact>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>URL</Table.HeaderCell>
                                <Table.HeaderCell>Владелец</Table.HeaderCell>
                                <Table.HeaderCell width={5}>Видимость</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {wikis.length === 0 && (
                                <Table.Row>
                                    <Table.Cell colSpan={3} disabled>
                                        Вики не найдены
                                    </Table.Cell>
                                </Table.Row>
                            )}
                            {wikis.map((w) => (
                                <Table.Row key={w.url} active={w.url === currentWiki}>
                                    <Table.Cell>
                                        <Button
                                            basic
                                            size="tiny"
                                            content={w.url}
                                            icon="folder open"
                                            onClick={() => goto(w.url)}
                                        />
                                        {w.url === currentWiki && (
                                            <Label size="tiny" color="blue" horizontal>
                                                текущая
                                            </Label>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>{w.owner}</Table.Cell>
                                    <Table.Cell>
                                        <Dropdown
                                            selection
                                            compact
                                            options={visibilityOptions}
                                            value={w.visibility}
                                            disabled={busy}
                                            onChange={(_, data) =>
                                                setVisibility(w.url, data.value as WikiVisibility)
                                            }
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                )}

                <Header as="h5">Новая вики</Header>
                <Form onSubmit={create}>
                    <Form.Group>
                        <Form.Input
                            width={6}
                            placeholder="url (slug)"
                            value={newUrl}
                            disabled={busy}
                            onChange={(_, data) => setNewUrl(data.value)}
                        />
                        <Form.Input
                            width={5}
                            placeholder="владелец (необязательно)"
                            value={newOwner}
                            disabled={busy}
                            onChange={(_, data) => setNewOwner(data.value)}
                        />
                        <Form.Field width={5}>
                            <Dropdown
                                selection
                                fluid
                                options={visibilityOptions}
                                value={newVisibility}
                                disabled={busy}
                                onChange={(_, data) => setNewVisibility(data.value as WikiVisibility)}
                            />
                        </Form.Field>
                    </Form.Group>
                    <Button
                        primary
                        type="submit"
                        icon="plus"
                        content="Создать вики"
                        loading={busy}
                        disabled={busy || !newUrl.trim()}
                    />
                </Form>
            </Modal.Content>
        </Modal>
    );
}

export default WikiAdminModal;
