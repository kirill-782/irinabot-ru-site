import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import {
    Button,
    Confirm,
    Dropdown,
    Form,
    Header,
    Icon,
    Input,
    Label,
    Loader,
    Message,
    Modal,
    Segment,
    Table,
} from "semantic-ui-react";
import { RestContext } from "../../context";
import { useTitle } from "../../hooks/useTitle";
import { HostPresetPropertyInWeb, HostPresetPropertyOutWeb } from "../../models/rest/HostPreset";
import { convertErrorResponseToString } from "../../utils/ApiUtils";

const PROPERTY_TYPES = ["bool", "string", "number", "text"];

interface PropertyFormData {
    name: string;
    type: string;
    category: string;
    titleLanguageKey: string;
    descriptionLanguageKey: string;
    defaultValue: string;
    validationJson: string;
}

const emptyForm = (): PropertyFormData => ({
    name: "",
    type: "string",
    category: "",
    titleLanguageKey: "",
    descriptionLanguageKey: "",
    defaultValue: "",
    validationJson: "",
});

function formToPayload(form: PropertyFormData): HostPresetPropertyInWeb {
    let validation: Record<string, unknown> | null = null;

    if (form.validationJson.trim()) {
        try {
            validation = JSON.parse(form.validationJson.trim());
        } catch {
            throw new Error("Некорректный JSON в поле validation");
        }
    }

    return {
        name: form.name.trim(),
        type: form.type,
        category: form.category.trim(),
        titleLanguageKey: form.titleLanguageKey.trim() || null,
        descriptionLanguageKey: form.descriptionLanguageKey.trim() || null,
        defaultValue: form.defaultValue.trim() || null,
        validation,
    };
}

function propertyToForm(prop: HostPresetPropertyOutWeb): PropertyFormData {
    return {
        name: prop.name ?? "",
        type: prop.type ?? "string",
        category: prop.category ?? "",
        titleLanguageKey: prop.titleLanguageKey ?? "",
        descriptionLanguageKey: prop.descriptionLanguageKey ?? "",
        defaultValue: prop.defaultValue ?? "",
        validationJson: prop.validation ? JSON.stringify(prop.validation, null, 2) : "",
    };
}

function HostPresetPropertiesPage() {
    const { hostPresetApi } = useContext(RestContext);

    useTitle("Стандартные свойства");

    const [properties, setProperties] = useState<HostPresetPropertyOutWeb[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<HostPresetPropertyOutWeb | null>(null);
    const [form, setForm] = useState<PropertyFormData>(emptyForm);
    const [saving, setSaving] = useState(false);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<HostPresetPropertyOutWeb | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Filter
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [filterText, setFilterText] = useState("");

    // Load properties
    const loadProperties = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setError("");
            try {
                const data = await hostPresetApi.getHostPresetProperties({ signal });
                setProperties(data);
            } catch (e) {
                if ((e as Error).message === "canceled") return;
                setError(convertErrorResponseToString(e));
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [hostPresetApi]
    );

    useEffect(() => {
        const controller = new AbortController();
        void loadProperties(controller.signal);
        return () => controller.abort();
    }, [loadProperties]);

    // Categories derived from loaded properties
    const categories = useMemo(() => {
        const set = new Set<string>();
        for (const p of properties) {
            if (p.category) set.add(p.category);
        }
        return Array.from(set).sort();
    }, [properties]);

    // Filtered list
    const filteredProperties = useMemo(() => {
        let result = properties;
        if (filterCategory) {
            result = result.filter((p) => p.category === filterCategory);
        }
        if (filterText.trim()) {
            const lower = filterText.trim().toLowerCase();
            result = result.filter(
                (p) =>
                    (p.name ?? "").toLowerCase().includes(lower) ||
                    (p.category ?? "").toLowerCase().includes(lower) ||
                    (p.titleLanguageKey ?? "").toLowerCase().includes(lower)
            );
        }
        return result;
    }, [properties, filterCategory, filterText]);

    // Open modal for create
    const openCreate = () => {
        setEditingProperty(null);
        setForm(emptyForm());
        setModalOpen(true);
    };

    // Open modal for edit
    const openEdit = (prop: HostPresetPropertyOutWeb) => {
        setEditingProperty(prop);
        setForm(propertyToForm(prop));
        setModalOpen(true);
    };

    // Save (create or update)
    const handleSave = async () => {
        let payload: HostPresetPropertyInWeb;
        try {
            payload = formToPayload(form);
        } catch (e) {
            toast({ title: (e as Error).message, type: "error" });
            return;
        }

        if (!payload.name) {
            toast({ title: "Укажите имя свойства", type: "error" });
            return;
        }
        if (!payload.category) {
            toast({ title: "Укажите категорию", type: "error" });
            return;
        }

        setSaving(true);
        try {
            if (editingProperty && editingProperty.id != null) {
                await hostPresetApi.updateHostPresetProperty(editingProperty.id, payload);
                toast({ title: "Свойство обновлено", type: "success" });
            } else {
                await hostPresetApi.createHostPresetProperty(payload);
                toast({ title: "Свойство создано", type: "success" });
            }
            setModalOpen(false);
            void loadProperties();
        } catch (e) {
            toast({
                title: "Ошибка сохранения",
                description: convertErrorResponseToString(e),
                type: "error",
                time: 10000,
            });
        } finally {
            setSaving(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!deleteTarget || deleteTarget.id == null) return;

        setDeleting(true);
        try {
            await hostPresetApi.deleteHostPresetProperty(deleteTarget.id);
            toast({ title: `Свойство "${deleteTarget.name}" удалено`, type: "success" });
            setDeleteTarget(null);
            void loadProperties();
        } catch (e) {
            toast({
                title: "Ошибка удаления",
                description: convertErrorResponseToString(e),
                type: "error",
                time: 10000,
            });
        } finally {
            setDeleting(false);
        }
    };

    // Form field updater
    const updateField = (field: keyof PropertyFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="host-preset-properties-page">
            <Header as="h1">Стандартные свойства</Header>
            <p>
                Управление списком известных свойств конфигурации хост-пресетов.
                Эти свойства определяют схему, по которой пользователи заполняют настройки пресетов.
            </p>

            {/* Toolbar */}
            <Segment>
                <div style={{ display: "flex", gap: "0.5em", flexWrap: "wrap", alignItems: "center" }}>
                    <Button
                        color="green"
                        content="Создать свойство"
                        icon="plus"
                        onClick={openCreate}
                        type="button"
                    />
                    <Button
                        basic
                        content="Обновить"
                        icon="refresh"
                        loading={loading}
                        onClick={() => { void loadProperties(); }}
                        type="button"
                    />
                    <div style={{ flex: 1 }} />
                    <Dropdown
                        clearable
                        onChange={(_, data) => setFilterCategory((data.value as string) || "")}
                        options={categories.map((c) => ({ key: c, value: c, text: c }))}
                        placeholder="Категория"
                        selection
                        value={filterCategory}
                    />
                    <Input
                        icon="search"
                        onChange={(_, data) => setFilterText(data.value as string)}
                        placeholder="Поиск..."
                        value={filterText}
                    />
                </div>
            </Segment>

            {/* Error */}
            {error && (
                <Message error>
                    <Message.Header>Ошибка загрузки</Message.Header>
                    <p>{error}</p>
                </Message>
            )}

            {/* Loading */}
            {loading && <Loader active inline="centered" style={{ marginTop: "2rem" }} />}

            {/* Table */}
            {!loading && !error && (
                <Table celled compact selectable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                            <Table.HeaderCell width={3}>Имя</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Тип</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Категория</Table.HeaderCell>
                            <Table.HeaderCell width={3}>По умолчанию</Table.HeaderCell>
                            <Table.HeaderCell width={3}>Ключи локализации</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Действия</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredProperties.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={7} textAlign="center">
                                    <em>Свойства не найдены</em>
                                </Table.Cell>
                            </Table.Row>
                        ) : (
                            filteredProperties.map((prop) => (
                                <Table.Row key={prop.id}>
                                    <Table.Cell>{prop.id}</Table.Cell>
                                    <Table.Cell>
                                        <strong>{prop.name}</strong>
                                        {prop.validation && (
                                            <Label basic size="mini" style={{ marginLeft: "0.5em" }}>
                                                validation
                                            </Label>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Label size="small">{prop.type}</Label>
                                    </Table.Cell>
                                    <Table.Cell>{prop.category}</Table.Cell>
                                    <Table.Cell>
                                        {prop.defaultValue != null ? (
                                            <code>{prop.defaultValue}</code>
                                        ) : (
                                            <em style={{ color: "#999" }}>—</em>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {prop.titleLanguageKey && (
                                            <div><small>title: {prop.titleLanguageKey}</small></div>
                                        )}
                                        {prop.descriptionLanguageKey && (
                                            <div><small>desc: {prop.descriptionLanguageKey}</small></div>
                                        )}
                                        {!prop.titleLanguageKey && !prop.descriptionLanguageKey && (
                                            <em style={{ color: "#999" }}>—</em>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell textAlign="center">
                                        <Button
                                            basic
                                            compact
                                            icon="edit"
                                            onClick={() => openEdit(prop)}
                                            size="small"
                                            title="Редактировать"
                                            type="button"
                                        />
                                        <Button
                                            basic
                                            color="red"
                                            compact
                                            icon="trash"
                                            onClick={() => setDeleteTarget(prop)}
                                            size="small"
                                            title="Удалить"
                                            type="button"
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        )}
                    </Table.Body>
                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan={7}>
                                Всего: {filteredProperties.length}
                                {filterCategory || filterText.trim()
                                    ? ` (из ${properties.length})`
                                    : ""}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            )}

            {/* Create/Edit Modal */}
            <Modal
                closeOnDimmerClick={!saving}
                onClose={() => !saving && setModalOpen(false)}
                open={modalOpen}
                size="small"
            >
                <Modal.Header>
                    <Icon name={editingProperty ? "edit" : "plus"} />
                    {editingProperty ? `Редактирование: ${editingProperty.name}` : "Новое свойство"}
                </Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field required>
                            <label>Имя (name)</label>
                            <Input
                                onChange={(_, data) => updateField("name", data.value as string)}
                                placeholder="botPropertyName"
                                value={form.name}
                            />
                        </Form.Field>
                        <Form.Group widths="equal">
                            <Form.Field required>
                                <label>Тип (type)</label>
                                <Dropdown
                                    fluid
                                    onChange={(_, data) => updateField("type", data.value as string)}
                                    options={PROPERTY_TYPES.map((t) => ({ key: t, value: t, text: t }))}
                                    selection
                                    value={form.type}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Категория (category)</label>
                                <Input
                                    list="category-suggestions"
                                    onChange={(_, data) => updateField("category", data.value as string)}
                                    placeholder="general"
                                    value={form.category}
                                />
                                <datalist id="category-suggestions">
                                    {categories.map((c) => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>Ключ заголовка (titleLanguageKey)</label>
                                <Input
                                    onChange={(_, data) => updateField("titleLanguageKey", data.value as string)}
                                    placeholder="config.property.title.key"
                                    value={form.titleLanguageKey}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>Ключ описания (descriptionLanguageKey)</label>
                                <Input
                                    onChange={(_, data) => updateField("descriptionLanguageKey", data.value as string)}
                                    placeholder="config.property.desc.key"
                                    value={form.descriptionLanguageKey}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Field>
                            <label>Значение по умолчанию (defaultValue)</label>
                            <Input
                                onChange={(_, data) => updateField("defaultValue", data.value as string)}
                                placeholder=""
                                value={form.defaultValue}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Validation (JSON)</label>
                            <Form.TextArea
                                onChange={(_, data) => updateField("validationJson", data.value as string)}
                                placeholder='{"min": 0, "max": 100}'
                                rows={4}
                                style={{ fontFamily: "monospace", fontSize: "0.9em" }}
                                value={form.validationJson}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        content="Отмена"
                        disabled={saving}
                        onClick={() => setModalOpen(false)}
                        type="button"
                    />
                    <Button
                        color="green"
                        content={editingProperty ? "Сохранить" : "Создать"}
                        disabled={saving}
                        icon="check"
                        loading={saving}
                        onClick={() => { void handleSave(); }}
                        primary
                        type="button"
                    />
                </Modal.Actions>
            </Modal>

            {/* Delete confirmation */}
            <Confirm
                cancelButton="Отмена"
                confirmButton={
                    <Button color="red" content="Удалить" loading={deleting} type="button" />
                }
                content={`Удалить свойство "${deleteTarget?.name}"? Это действие необратимо.`}
                header="Подтверждение удаления"
                onCancel={() => !deleting && setDeleteTarget(null)}
                onConfirm={() => { void handleDelete(); }}
                open={deleteTarget !== null}
            />
        </div>
    );
}

export default HostPresetPropertiesPage;
