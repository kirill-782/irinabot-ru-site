import React, { useCallback, useEffect, useState } from "react";
import {
    Button,
    Dropdown,
    Form,
    Input,
    Label,
    Loader,
    Message,
    Modal,
    Table,
} from "semantic-ui-react";
import { WikiTokenDto, WikiTokenRole, WikiTokenSecretDto } from "../../models/rest/Wiki";
import { WikiService } from "../../services/WikiService";

interface WikiTokensModalProps {
    open: boolean;
    api: WikiService;
    wiki: string;
    onClose: () => void;
}

const roleOptions = [
    { key: "READ", value: "READ", text: "Чтение" },
    { key: "WRITE", value: "WRITE", text: "Запись" },
];

function WikiTokensModal({ open, api, wiki, onClose }: WikiTokensModalProps) {
    const [tokens, setTokens] = useState<WikiTokenDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [newName, setNewName] = useState("");
    const [newRole, setNewRole] = useState<WikiTokenRole>("READ");
    // секрет показывается ОДИН раз — сразу после создания
    const [secret, setSecret] = useState<WikiTokenSecretDto | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setTokens(await api.getWikiTokens(wiki));
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Не удалось загрузить токены");
        }
        setLoading(false);
    }, [api, wiki]);

    useEffect(() => {
        if (open) {
            setNewName("");
            setNewRole("READ");
            setSecret(null);
            load();
        }
    }, [open, load]);

    const create = async () => {
        setBusy(true);
        setError(null);
        try {
            const dto = await api.createWikiToken(wiki, {
                name: newName.trim() || undefined,
                role: newRole,
            });
            setSecret(dto);
            setNewName("");
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Не удалось создать токен");
        }
        setBusy(false);
    };

    const revoke = async (id: number) => {
        setBusy(true);
        setError(null);
        try {
            await api.revokeWikiToken(wiki, id);
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Не удалось отозвать токен");
        }
        setBusy(false);
    };

    const copy = (text: string) => navigator.clipboard?.writeText(text);

    return (
        <Modal open={open} onClose={onClose} size="small" closeIcon>
            <Modal.Header>Токены ботов — «{wiki}»</Modal.Header>
            <Modal.Content>
                {error && <Message error content={error} />}

                <Message info size="small">
                    Токен авторизует бота для одной вики. Передавайте его в заголовке{" "}
                    <code>Authorization: Bot &lt;токен&gt;</code>. Роль <b>READ</b> — только чтение,{" "}
                    <b>WRITE</b> — чтение и запись.
                </Message>

                {secret && (
                    <Message success onDismiss={() => setSecret(null)}>
                        <Message.Header>Токен создан — скопируйте сейчас</Message.Header>
                        <p style={{ margin: "0.5em 0" }}>
                            Секрет показывается один раз и больше не будет доступен.
                        </p>
                        <Input
                            fluid
                            readOnly
                            value={secret.token}
                            action={{
                                icon: "copy",
                                title: "Скопировать",
                                onClick: () => copy(secret.token),
                            }}
                        />
                    </Message>
                )}

                {loading ? (
                    <Loader active inline="centered" />
                ) : (
                    <Table basic="very" compact>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Название</Table.HeaderCell>
                                <Table.HeaderCell>Роль</Table.HeaderCell>
                                <Table.HeaderCell>Статус</Table.HeaderCell>
                                <Table.HeaderCell collapsing />
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {tokens.length === 0 && (
                                <Table.Row>
                                    <Table.Cell colSpan={4} disabled>
                                        Токенов нет
                                    </Table.Cell>
                                </Table.Row>
                            )}
                            {tokens.map((t) => (
                                <Table.Row key={t.id} disabled={!t.active}>
                                    <Table.Cell>{t.name || <i>без имени</i>}</Table.Cell>
                                    <Table.Cell>{t.role === "WRITE" ? "Запись" : "Чтение"}</Table.Cell>
                                    <Table.Cell>
                                        <Label size="tiny" color={t.active ? "green" : "grey"} horizontal>
                                            {t.active ? "активен" : "отозван"}
                                        </Label>
                                    </Table.Cell>
                                    <Table.Cell collapsing>
                                        {t.active && (
                                            <Button
                                                basic
                                                color="red"
                                                icon="trash"
                                                size="tiny"
                                                title="Отозвать токен"
                                                disabled={busy}
                                                onClick={() => revoke(t.id)}
                                            />
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                )}

                <Form onSubmit={create} style={{ marginTop: "1em" }}>
                    <Form.Group>
                        <Form.Field width={8}>
                            <Input
                                placeholder="Название (необязательно)"
                                value={newName}
                                disabled={busy}
                                onChange={(_, data) => setNewName(data.value)}
                            />
                        </Form.Field>
                        <Form.Field width={5}>
                            <Dropdown
                                selection
                                fluid
                                options={roleOptions}
                                value={newRole}
                                disabled={busy}
                                onChange={(_, data) => setNewRole(data.value as WikiTokenRole)}
                            />
                        </Form.Field>
                        <Form.Field width={3}>
                            <Button
                                fluid
                                primary
                                type="submit"
                                icon="plus"
                                content="Создать"
                                loading={busy}
                                disabled={busy}
                            />
                        </Form.Field>
                    </Form.Group>
                </Form>
            </Modal.Content>
        </Modal>
    );
}

export default WikiTokensModal;
