import React, { useCallback, useContext, useEffect, useState } from "react";
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
import { AppRuntimeSettingsContext } from "../../context";

interface WikiTokensModalProps {
    open: boolean;
    api: WikiService;
    wiki: string;
    onClose: () => void;
}

function WikiTokensModal({ open, api, wiki, onClose }: WikiTokensModalProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const roleOptions = [
        { key: "READ", value: "READ", text: t("wikiTokensRoleRead") },
        { key: "WRITE", value: "WRITE", text: t("wikiTokensRoleWrite") },
    ];

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
            setError(e?.response?.data?.message || e?.message || t("wikiTokensLoadError"));
        }
        setLoading(false);
    }, [api, wiki, t]);

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
            setError(e?.response?.data?.message || e?.message || t("wikiTokensCreateError"));
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
            setError(e?.response?.data?.message || e?.message || t("wikiTokensRevokeError"));
        }
        setBusy(false);
    };

    const copy = (text: string) => navigator.clipboard?.writeText(text);

    return (
        <Modal open={open} onClose={onClose} size="small" closeIcon>
            <Modal.Header>{t("wikiTokensTitle", { wiki })}</Modal.Header>
            <Modal.Content>
                {error && <Message error content={error} />}

                <Message info size="small">
                    {t("wikiTokensInfoIntro")}{" "}
                    <code>Authorization: Bot &lt;{t("wikiTokensInfoTokenWord")}&gt;</code>. {t("wikiTokensInfoRolePrefix")} <b>READ</b> {t("wikiTokensInfoRoleRead")},{" "}
                    <b>WRITE</b> {t("wikiTokensInfoRoleWrite")}.
                </Message>

                {secret && (
                    <Message success onDismiss={() => setSecret(null)}>
                        <Message.Header>{t("wikiTokensSecretHeader")}</Message.Header>
                        <p style={{ margin: "0.5em 0" }}>
                            {t("wikiTokensSecretHint")}
                        </p>
                        <Input
                            fluid
                            readOnly
                            value={secret.token}
                            action={{
                                icon: "copy",
                                title: t("wikiTokensCopy"),
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
                                <Table.HeaderCell>{t("wikiTokensColName")}</Table.HeaderCell>
                                <Table.HeaderCell>{t("wikiTokensColRole")}</Table.HeaderCell>
                                <Table.HeaderCell>{t("wikiTokensColStatus")}</Table.HeaderCell>
                                <Table.HeaderCell collapsing />
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {tokens.length === 0 && (
                                <Table.Row>
                                    <Table.Cell colSpan={4} disabled>
                                        {t("wikiTokensEmpty")}
                                    </Table.Cell>
                                </Table.Row>
                            )}
                            {tokens.map((token) => (
                                <Table.Row key={token.id} disabled={!token.active}>
                                    <Table.Cell>{token.name || <i>{t("wikiTokensNoName")}</i>}</Table.Cell>
                                    <Table.Cell>{token.role === "WRITE" ? t("wikiTokensRoleWrite") : t("wikiTokensRoleRead")}</Table.Cell>
                                    <Table.Cell>
                                        <Label size="tiny" color={token.active ? "green" : "grey"} horizontal>
                                            {token.active ? t("wikiTokensStatusActive") : t("wikiTokensStatusRevoked")}
                                        </Label>
                                    </Table.Cell>
                                    <Table.Cell collapsing>
                                        {token.active && (
                                            <Button
                                                basic
                                                color="red"
                                                icon="trash"
                                                size="tiny"
                                                title={t("wikiTokensRevokeTooltip")}
                                                disabled={busy}
                                                onClick={() => revoke(token.id)}
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
                                placeholder={t("wikiTokensNamePlaceholder")}
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
                                content={t("wikiTokensCreate")}
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
