import React, { useContext, useState } from "react";
import {
    Button,
    Dropdown,
    Form,
    Icon,
    Input,
    List,
    Message,
    Segment,
    Table,
} from "semantic-ui-react";
import {
    CONDITION_OPERATORS,
    ConditionEntry,
    ConditionOperator,
    ConditionVariablesData,
} from "../../models/rest/HostPreset";
import { AppRuntimeSettingsContext } from "../../context";

const OPERATION_OPTIONS = CONDITION_OPERATORS.map((op) => ({ key: op, value: op, text: op }));

interface ConditionVariableEditorProps {
    data: ConditionVariablesData | null | undefined;
    onChange: (data: ConditionVariablesData) => void;
}

function ConditionVariableEditor({ data, onChange }: ConditionVariableEditorProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const variables: ConditionVariablesData = data ?? {};
    const variableNames = Object.keys(variables);

    const [selectedVar, setSelectedVar] = useState<string | null>(null);
    const [newVarName, setNewVarName] = useState("");

    // New condition draft
    const [newCondVariable, setNewCondVariable] = useState("");
    const [newCondOperator, setNewCondOperator] = useState<ConditionOperator>("Equal");
    const [newCondValue, setNewCondValue] = useState("");
    const [newCondResult, setNewCondResult] = useState("");

    const commit = onChange;

    // ---- Variable CRUD ----

    const createVariable = () => {
        const name = newVarName.trim();
        if (!name || variables[name]) return;

        const next = { ...variables, [name]: { defaultValue: "", conditions: [] } };
        commit(next);
        setSelectedVar(name);
        setNewVarName("");
    };

    const deleteVariable = () => {
        if (selectedVar === null) return;
        const next = { ...variables };
        delete next[selectedVar];
        commit(next);
        setSelectedVar(null);
    };

    const renameVariable = (newName: string) => {
        if (selectedVar === null) return;
        const trimmed = newName.trim();
        if (!trimmed || (trimmed !== selectedVar && variables[trimmed])) return;

        const next: ConditionVariablesData = {};
        for (const key of Object.keys(variables)) {
            if (key === selectedVar) {
                next[trimmed] = variables[key];
            } else {
                next[key] = variables[key];
            }
        }
        commit(next);
        setSelectedVar(trimmed);
    };

    const updateDefaultValue = (value: string) => {
        if (selectedVar === null) return;
        const next = {
            ...variables,
            [selectedVar]: { ...variables[selectedVar], defaultValue: value },
        };
        commit(next);
    };

    // ---- Condition CRUD ----

    const currentVar = selectedVar !== null ? variables[selectedVar] : null;
    const conditions = currentVar?.conditions ?? [];

    const addCondition = () => {
        if (selectedVar === null || !newCondVariable.trim()) return;
        const entry: ConditionEntry = {
            variable: newCondVariable.trim(),
            operator: newCondOperator,
            value: newCondValue,
            result: newCondResult,
        };
        const next = {
            ...variables,
            [selectedVar]: {
                ...variables[selectedVar],
                conditions: [...conditions, entry],
            },
        };
        commit(next);
        setNewCondVariable("");
        setNewCondValue("");
        setNewCondResult("");
    };

    const updateCondition = (index: number, field: keyof ConditionEntry, value: string) => {
        if (selectedVar === null) return;
        const updated = conditions.map((c, i) =>
            i === index ? { ...c, [field]: value } : c
        );
        const next = {
            ...variables,
            [selectedVar]: {
                ...variables[selectedVar],
                conditions: updated,
            },
        };
        commit(next);
    };

    const removeCondition = (index: number) => {
        if (selectedVar === null) return;
        const next = {
            ...variables,
            [selectedVar]: {
                ...variables[selectedVar],
                conditions: conditions.filter((_, i) => i !== index),
            },
        };
        commit(next);
    };

    const moveCondition = (index: number, direction: -1 | 1) => {
        if (selectedVar === null) return;
        const target = index + direction;
        if (target < 0 || target >= conditions.length) return;

        const newConditions = [...conditions];
        [newConditions[index], newConditions[target]] = [newConditions[target], newConditions[index]];
        const next = {
            ...variables,
            [selectedVar]: {
                ...variables[selectedVar],
                conditions: newConditions,
            },
        };
        commit(next);
    };

    return (
        <div className="condition-variable-editor">
            <div className="layout">
                {/* Left: variable list */}
                <div className="sidebar">
                    <div className="sidebar-controls">
                        <Input
                            fluid
                            onChange={(_, d) => setNewVarName(d.value as string)}
                            placeholder={t("hostPresetConditionEditorVariableNamePlaceholder")}
                            size="small"
                            value={newVarName}
                        />
                        <Button
                            color="green"
                            content={t("create")}
                            disabled={!newVarName.trim() || !!variables[newVarName.trim()]}
                            fluid
                            onClick={createVariable}
                            size="small"
                            type="button"
                        />
                    </div>

                    <Segment className="list-segment">
                        <List selection verticalAlign="middle" className="var-list">
                            {variableNames.map((name) => (
                                <List.Item
                                    key={name}
                                    active={selectedVar === name}
                                    onClick={() => setSelectedVar(name)}
                                >
                                    <List.Content>
                                        {name}
                                    </List.Content>
                                </List.Item>
                            ))}
                            {variableNames.length === 0 && (
                                <List.Item disabled>
                                    <List.Content>
                                        <em>{t("hostPresetConditionEditorNoVariables")}</em>
                                    </List.Content>
                                </List.Item>
                            )}
                        </List>
                    </Segment>

                    <Button
                        className="delete-btn"
                        color="red"
                        content={t("remove")}
                        disabled={selectedVar === null}
                        fluid
                        onClick={deleteVariable}
                        size="small"
                        type="button"
                    />
                </div>

                {/* Right: variable detail */}
                <div className="detail">
                    {selectedVar === null ? (
                        <Message info>
                            {t("hostPresetConditionEditorSelectVariableMessage")}
                        </Message>
                    ) : (
                        <>
                            <Segment>
                                <Form>
                                    <Form.Field>
                                        <label>{t("hostPresetConditionEditorVariableNameLabel")}</label>
                                        <Input
                                            value={selectedVar}
                                            onChange={(_, d) => renameVariable(d.value as string)}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <label>{t("hostPresetConditionEditorDefaultValueLabel")}</label>
                                        <Input
                                            value={currentVar?.defaultValue ?? ""}
                                            onChange={(_, d) => updateDefaultValue(d.value as string)}
                                        />
                                    </Form.Field>
                                </Form>
                            </Segment>

                            <Table celled compact>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>{t("hostPresetConditionEditorVariableColumn")}</Table.HeaderCell>
                                        <Table.HeaderCell>{t("hostPresetConditionEditorOperatorColumn")}</Table.HeaderCell>
                                        <Table.HeaderCell>{t("hostPresetConditionEditorValueColumn")}</Table.HeaderCell>
                                        <Table.HeaderCell>{t("hostPresetConditionEditorResultColumn")}</Table.HeaderCell>
                                        <Table.HeaderCell width={3}>{t("actions")}</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {conditions.length === 0 ? (
                                        <Table.Row>
                                            <Table.Cell colSpan={5} textAlign="center">
                                                <em>{t("hostPresetConditionEditorNoConditions")}</em>
                                            </Table.Cell>
                                        </Table.Row>
                                    ) : (
                                        conditions.map((cond, idx) => (
                                            <Table.Row key={idx}>
                                                <Table.Cell>
                                                    <Input
                                                        fluid
                                                        size="mini"
                                                        value={cond.variable}
                                                        onChange={(_, d) => updateCondition(idx, "variable", d.value as string)}
                                                    />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Dropdown
                                                        compact
                                                        fluid
                                                        onChange={(_, d) => updateCondition(idx, "operator", d.value as string)}
                                                        options={OPERATION_OPTIONS}
                                                        selection
                                                        value={cond.operator}
                                                    />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Input
                                                        fluid
                                                        size="mini"
                                                        value={cond.value}
                                                        onChange={(_, d) => updateCondition(idx, "value", d.value as string)}
                                                    />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Input
                                                        fluid
                                                        size="mini"
                                                        value={cond.result}
                                                        onChange={(_, d) => updateCondition(idx, "result", d.value as string)}
                                                    />
                                                </Table.Cell>
                                                <Table.Cell textAlign="center">
                                                    <Button
                                                        basic
                                                        compact
                                                        disabled={idx === 0}
                                                        icon
                                                        onClick={() => moveCondition(idx, -1)}
                                                        size="mini"
                                                        title={t("hostPresetConditionEditorMoveUp")}
                                                        type="button"
                                                    >
                                                        <Icon name="arrow up" />
                                                    </Button>
                                                    <Button
                                                        basic
                                                        compact
                                                        disabled={idx === conditions.length - 1}
                                                        icon
                                                        onClick={() => moveCondition(idx, 1)}
                                                        size="mini"
                                                        title={t("hostPresetConditionEditorMoveDown")}
                                                        type="button"
                                                    >
                                                        <Icon name="arrow down" />
                                                    </Button>
                                                    <Button
                                                        basic
                                                        color="red"
                                                        compact
                                                        icon
                                                        onClick={() => removeCondition(idx)}
                                                        size="mini"
                                                        title={t("remove")}
                                                        type="button"
                                                    >
                                                        <Icon name="close" />
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))
                                    )}
                                </Table.Body>
                            </Table>

                            {/* New condition form */}
                            <Segment secondary>
                                <Form size="small">
                                    <Form.Group widths="equal">
                                        <Form.Field>
                                            <label>{t("hostPresetConditionEditorVariableColumn")}</label>
                                            <Input
                                                value={newCondVariable}
                                                onChange={(_, d) => setNewCondVariable(d.value as string)}
                                                placeholder="CORE_CONNECTOR_ID"
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>{t("hostPresetConditionEditorOperatorColumn")}</label>
                                            <Dropdown
                                                fluid
                                                selection
                                                options={OPERATION_OPTIONS}
                                                value={newCondOperator}
                                                onChange={(_, d) => setNewCondOperator(d.value as ConditionOperator)}
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>{t("hostPresetConditionEditorValueColumn")}</label>
                                            <Input
                                                value={newCondValue}
                                                onChange={(_, d) => setNewCondValue(d.value as string)}
                                                placeholder="8"
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>{t("hostPresetConditionEditorResultColumn")}</label>
                                            <Input
                                                value={newCondResult}
                                                onChange={(_, d) => setNewCondResult(d.value as string)}
                                                placeholder="Kokomi"
                                            />
                                        </Form.Field>
                                    </Form.Group>
                                </Form>
                                <Button
                                    content={t("hostPresetConditionEditorCreateCondition")}
                                    disabled={!newCondVariable.trim()}
                                    icon="plus"
                                    onClick={addCondition}
                                    size="small"
                                    type="button"
                                />
                            </Segment>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ConditionVariableEditor;
