import React, { useContext } from "react";
import {
    Button,
    Checkbox,
    Form,
    Header,
    Icon,
    Input,
    Table,
} from "semantic-ui-react";
import {
    HostPresetBnetAccount,
    HostPresetBnets,
    PRIORITY_ACCOUNT_POLICIES,
} from "../../models/rest/HostPreset";
import { AppRuntimeSettingsContext } from "../../context";

const PRIORITY_ACCOUNT_POLICY_OPTIONS = PRIORITY_ACCOUNT_POLICIES.map((name, index) => ({
    key: index,
    value: index,
    text: name,
}));

interface BnetsSectionProps {
    bnets: HostPresetBnets;
    onBnetsChange: (bnets: HostPresetBnets) => void;
}

function BnetsSection({ bnets, onBnetsChange }: BnetsSectionProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const accounts = bnets.accounts ?? [];

    const updateField = (field: keyof HostPresetBnets, value: any) => {
        onBnetsChange({ ...bnets, [field]: value });
    };

    const updateAccount = (index: number, field: keyof HostPresetBnetAccount, value: any) => {
        const newAccounts = [...accounts];
        newAccounts[index] = { ...newAccounts[index], [field]: value };
        onBnetsChange({ ...bnets, accounts: newAccounts });
    };

    const addAccount = () => {
        onBnetsChange({
            ...bnets,
            accounts: [
                ...accounts,
                { realmTag: "I", refreshInterval: 60, priorityAccount: "" },
            ],
        });
    };

    const removeAccount = (index: number) => {
        onBnetsChange({ ...bnets, accounts: accounts.filter((_, i) => i !== index) });
    };

    return (
        <div className="config-section">
            <Form>
                <Form.Group widths="equal">
                    <Form.Field>
                        <label>&nbsp;</label>
                        <Checkbox
                            toggle
                            label={t("hostPresetBnetsAllowRehost")}
                            checked={!!bnets.allowRehost}
                            onChange={(_, data) => updateField("allowRehost", data.checked)}
                        />
                    </Form.Field>
                    <Form.Select
                        label={t("hostPresetBnetsPriorityAccountPolicy")}
                        options={PRIORITY_ACCOUNT_POLICY_OPTIONS}
                        value={bnets.priorityAccountPolicy ?? 0}
                        onChange={(_, data) => updateField("priorityAccountPolicy", data.value)}
                    />
                </Form.Group>

                <Header as="h4" dividing>
                    {t("hostPresetBnetsAccountsHeader")}
                </Header>

                {accounts.length > 0 && (
                    <Table compact celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>{t("hostPresetBnetsRealmHeader")}</Table.HeaderCell>
                                <Table.HeaderCell>{t("hostPresetBnetsRefreshIntervalHeader")}</Table.HeaderCell>
                                <Table.HeaderCell>{t("hostPresetBnetsPriorityAccountHeader")}</Table.HeaderCell>
                                <Table.HeaderCell width={1} />
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {accounts.map((account, index) => (
                                <Table.Row key={index}>
                                    <Table.Cell>
                                        <Input
                                            size="small"
                                            value={account.realmTag ?? ""}
                                            onChange={(_, data) =>
                                                updateAccount(index, "realmTag", data.value)
                                            }
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Input
                                            size="small"
                                            type="number"
                                            value={account.refreshInterval ?? 60}
                                            onChange={(_, data) =>
                                                updateAccount(index, "refreshInterval", Number(data.value))
                                            }
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Input
                                            size="small"
                                            value={account.priorityAccount ?? ""}
                                            onChange={(_, data) =>
                                                updateAccount(index, "priorityAccount", data.value)
                                            }
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button
                                            icon="trash"
                                            size="mini"
                                            color="red"
                                            basic
                                            onClick={() => removeAccount(index)}
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                )}

                <Button icon labelPosition="left" size="small" onClick={addAccount}>
                    <Icon name="plus" />
                    {t("hostPresetBnetsAddAccount")}
                </Button>
            </Form>
        </div>
    );
}

export default BnetsSection;
