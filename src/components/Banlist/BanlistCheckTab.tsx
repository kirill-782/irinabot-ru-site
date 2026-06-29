import React, { useContext, useState } from "react";
import { Button, Form, Header, Icon, Label, Message, Segment, Table } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { useBanlistCheck } from "../../hooks/useBanlistCheck";
import { formatExpire, subjectString } from "../../utils/BanlistUtils";
import BanlistActionText from "./BanlistActionText";

interface BanlistCheckTabProps {
    banlistId: number;
}

function BanlistCheckTab({ banlistId }: BanlistCheckTabProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [userId, setUserId] = useState("");
    const [pvpgnRealm, setPvpgnRealm] = useState("");
    const [pvpgnName, setPvpgnName] = useState("");
    const [ip, setIp] = useState("");
    const [hardwareId, setHardwareId] = useState("");

    const { result, isLoading, errorMessage, check } = useBanlistCheck(banlistId);

    const handleCheck = () =>
        check({ userId, pvpgnRealm, pvpgnName, ip, hardwareId });

    const restrictions = result?.restrictions || [];

    return (
        <div>
            <Segment>
                <Header as="h4">
                    {t("banlistCheckHeader")}
                    <Header.Subheader>{t("banlistCheckHint")}</Header.Subheader>
                </Header>
                <Form>
                    <Form.Group widths="equal">
                        <Form.Input
                            label="userId"
                            onChange={(_, data) => setUserId(data.value)}
                            placeholder="u-8f2a-9001"
                            value={userId}
                        />
                        <Form.Input
                            label="pvpgnRealm"
                            onChange={(_, data) => setPvpgnRealm(data.value)}
                            placeholder="EU, RU..."
                            value={pvpgnRealm}
                        />
                        <Form.Input
                            label="pvpgnName"
                            onChange={(_, data) => setPvpgnName(data.value)}
                            placeholder="nickname"
                            value={pvpgnName}
                        />
                    </Form.Group>
                    <Form.Group widths="equal">
                        <Form.Input
                            label="IP"
                            onChange={(_, data) => setIp(data.value)}
                            placeholder="10.0.0.5"
                            value={ip}
                        />
                        <Form.Input
                            label="Hardware ID"
                            onChange={(_, data) => setHardwareId(data.value)}
                            placeholder="HWID-xxxx"
                            value={hardwareId}
                        />
                    </Form.Group>
                </Form>
                <Button loading={isLoading} onClick={() => void handleCheck()} primary>
                    <Icon name="search" />
                    {t("banlistCheckButton")}
                </Button>
            </Segment>

            {errorMessage && <Message error>{errorMessage}</Message>}

            {result && (
                <Segment>
                    {restrictions.length === 0 ? (
                        <Message positive>
                            <Message.Header>{t("banlistCheckNoRestrictionsHeader")}</Message.Header>
                            <p>{t("banlistCheckNoRestrictionsText")}</p>
                        </Message>
                    ) : (
                        <>
                            <Message negative>
                                <Message.Header>
                                    {t("banlistCheckFoundHeader", { count: restrictions.length })}
                                </Message.Header>
                            </Message>
                            <Table basic="very" compact>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>{t("banlistSubjectHeader")}</Table.HeaderCell>
                                        <Table.HeaderCell>{t("banlistActionHeader")}</Table.HeaderCell>
                                        <Table.HeaderCell>{t("banlistReasonHeader")}</Table.HeaderCell>
                                        <Table.HeaderCell>{t("banlistCheckStatusHeader")}</Table.HeaderCell>
                                        <Table.HeaderCell>{t("banlistExpireHeader")}</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {restrictions.map((entry) => {
                                        const computed = entry.computed;
                                        const pendingDeferred = !!computed?.pendingDeferred;

                                        return (
                                            <Table.Row key={entry.id}>
                                                <Table.Cell>
                                                    <code>{subjectString(entry.subject)}</code>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <BanlistActionText action={entry.action} />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <div>
                                                        {entry.reason || <i>{t("banlistNoReason")}</i>}
                                                    </div>
                                                    {entry.tag && (
                                                        <Label basic size="mini">
                                                            #{entry.tag}
                                                        </Label>
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {pendingDeferred ? (
                                                        <Label color="yellow" size="mini">
                                                            {t("banlistCheckStatusPendingDeferred")}
                                                        </Label>
                                                    ) : computed?.recentlyActivated ? (
                                                        <Label color="olive" size="mini">
                                                            {t("banlistCheckStatusRecentlyActivated")}
                                                        </Label>
                                                    ) : (
                                                        <Label color="green" size="mini">
                                                            {t("banlistCheckStatusActive")}
                                                        </Label>
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {pendingDeferred
                                                        ? "—"
                                                        : formatExpire(t, {
                                                              ...entry,
                                                              expireAt:
                                                                  computed?.effectiveExpireAt ??
                                                                  entry.expireAt,
                                                          })}
                                                </Table.Cell>
                                            </Table.Row>
                                        );
                                    })}
                                </Table.Body>
                            </Table>
                        </>
                    )}
                </Segment>
            )}
        </div>
    );
}

export default BanlistCheckTab;
