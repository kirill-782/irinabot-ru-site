import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, Dropdown, Form, Input, Loader, Message, Modal, Table } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { AclEntryDto, WikiAclRole } from "../../models/rest/Wiki";
import { WikiService } from "../../services/WikiService";

interface WikiAclModalProps {
    open: boolean;
    api: WikiService;
    wiki: string;
    onClose: () => void;
}

function WikiAclModal({ open, api, wiki, onClose }: WikiAclModalProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const roleOptions = [
        { key: "VIEWER", value: "VIEWER", text: t("wikiAclRoleViewer") },
        { key: "EDITOR", value: "EDITOR", text: t("wikiAclRoleEditor") },
    ];

    const [entries, setEntries] = useState<AclEntryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [newUserId, setNewUserId] = useState("");
    const [newRole, setNewRole] = useState<WikiAclRole>("VIEWER");

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setEntries(await api.getWikiAcl(wiki));
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || t("wikiAclLoadError"));
        }
        setLoading(false);
    }, [api, wiki, t]);

    useEffect(() => {
        if (open) {
            setNewUserId("");
            setNewRole("VIEWER");
            load();
        }
    }, [open, load]);

    const setRole = async (userId: string, role: WikiAclRole) => {
        setBusy(true);
        setError(null);
        try {
            await api.setWikiAclRole(wiki, userId, { role });
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || t("wikiAclSetRoleError"));
        }
        setBusy(false);
    };

    const remove = async (userId: string) => {
        setBusy(true);
        setError(null);
        try {
            await api.removeWikiAcl(wiki, userId);
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || t("wikiAclRemoveError"));
        }
        setBusy(false);
    };

    const add = async () => {
        const userId = newUserId.trim();
        if (!userId) return;
        await setRole(userId, newRole);
        setNewUserId("");
    };

    return (
        <Modal open={open} onClose={onClose} size="small" closeIcon>
            <Modal.Header>{t("wikiAclTitle", { wiki })}</Modal.Header>
            <Modal.Content>
                {error && <Message error content={error} />}

                {loading ? (
                    <Loader active inline="centered" />
                ) : (
                    <Table basic="very" compact>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>{t("wikiAclUserColumn")}</Table.HeaderCell>
                                <Table.HeaderCell width={5}>{t("wikiAclRoleColumn")}</Table.HeaderCell>
                                <Table.HeaderCell collapsing />
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {entries.length === 0 && (
                                <Table.Row>
                                    <Table.Cell colSpan={3} disabled>
                                        {t("wikiAclEmpty")}
                                    </Table.Cell>
                                </Table.Row>
                            )}
                            {entries.map((entry) => (
                                <Table.Row key={entry.userId}>
                                    <Table.Cell>{entry.userId}</Table.Cell>
                                    <Table.Cell>
                                        <Dropdown
                                            selection
                                            fluid
                                            options={roleOptions}
                                            value={entry.role}
                                            disabled={busy}
                                            onChange={(_, data) =>
                                                setRole(entry.userId, data.value as WikiAclRole)
                                            }
                                        />
                                    </Table.Cell>
                                    <Table.Cell collapsing>
                                        <Button
                                            basic
                                            color="red"
                                            icon="trash"
                                            size="tiny"
                                            disabled={busy}
                                            title={t("wikiAclRemoveTooltip")}
                                            onClick={() => remove(entry.userId)}
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                )}

                <Form onSubmit={add} style={{ marginTop: "1em" }}>
                    <Form.Group>
                        <Form.Field width={8}>
                            <Input
                                placeholder={t("wikiAclUserIdPlaceholder")}
                                value={newUserId}
                                disabled={busy}
                                onChange={(_, data) => setNewUserId(data.value)}
                            />
                        </Form.Field>
                        <Form.Field width={5}>
                            <Dropdown
                                selection
                                fluid
                                options={roleOptions}
                                value={newRole}
                                disabled={busy}
                                onChange={(_, data) => setNewRole(data.value as WikiAclRole)}
                            />
                        </Form.Field>
                        <Form.Field width={3}>
                            <Button
                                fluid
                                primary
                                type="submit"
                                icon="plus"
                                content={t("wikiAclAddButton")}
                                loading={busy}
                                disabled={busy || !newUserId.trim()}
                            />
                        </Form.Field>
                    </Form.Group>
                </Form>
            </Modal.Content>
        </Modal>
    );
}

export default WikiAclModal;
