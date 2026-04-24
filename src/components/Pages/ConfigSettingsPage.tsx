import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Grid, Header, Icon, Loader, Message } from "semantic-ui-react";
import { toast } from "@kokomi/react-semantic-toasts";
import { useConfigSchema } from "../../hooks/useConfigSchema";
import { useConfigPresets } from "../../hooks/useConfigPresets";
import { useConfigPreset } from "../../hooks/useConfigPreset";
import { useConfigSearch } from "../../hooks/useConfigSearch";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import ConfigToolbar from "../ConfigSettings/ConfigToolbar";
import ConfigCategoryMenu from "../ConfigSettings/ConfigCategoryMenu";
import ConfigContentArea from "../ConfigSettings/ConfigContentArea";
import NewPresetModal from "../ConfigSettings/NewPresetModal";
import "./ConfigSettingsPage.scss";

function ConfigSettingsPage() {
    const { id: idParam } = useParams<{ id?: string }>();
    const navigate = useNavigate();

    // Preset ID derived directly from URL — stays in sync on back/forward navigation
    const selectedPresetId = useMemo(() => {
        const parsed = idParam ? parseInt(idParam, 10) : null;
        return parsed !== null && !isNaN(parsed) ? parsed : null;
    }, [idParam]);

    const selectPreset = useCallback(
        (id: number | null) => {
            if (id === null) navigate("/host-presets");
            else navigate(`/host-presets/${id}`);
        },
        [navigate]
    );

    // Hooks
    const { schema, categories, isLoading: schemaLoading } = useConfigSchema();
    const { presets, isLoading: presetsLoading, createPreset, deletePreset } = useConfigPresets();
    const preset = useConfigPreset(selectedPresetId, schema);
    const search = useConfigSearch(schema, categories);

    // UI state
    const [activeCategory, setActiveCategory] = useState("general");
    const [newPresetOpen, setNewPresetOpen] = useState(false);

    const handleCreatePreset = useCallback(
        async (name: string) => {
            try {
                const created = await createPreset(name);
                selectPreset(created.id ?? null);
                toast({ title: "Пресет создан", icon: "check" });
            } catch (e) {
                toast({
                    title: "Ошибка создания",
                    description: convertErrorResponseToString(e),
                    color: "red",
                });
                throw e;
            }
        },
        [createPreset, selectPreset]
    );

    const handleDeletePreset = useCallback(() => {
        if (selectedPresetId === null) return;
        deletePreset(selectedPresetId)
            .then(() => {
                selectPreset(null);
                toast({ title: "Пресет удалён", icon: "trash" });
            })
            .catch((e) => {
                toast({
                    title: "Ошибка удаления",
                    description: convertErrorResponseToString(e),
                    color: "red",
                });
            });
    }, [selectedPresetId, deletePreset, selectPreset]);

    const isInitialLoading = schemaLoading || presetsLoading;

    return (
        <Container className="extra config-settings-page">
            <Header as="h2">
                <Icon name="cogs" />
                <Header.Content>Настройки конфигурации</Header.Content>
            </Header>

            <ConfigToolbar
                presets={presets}
                presetsLoading={presetsLoading}
                selectedPresetId={selectedPresetId}
                onSelectPreset={selectPreset}
                onNewPreset={() => setNewPresetOpen(true)}
                onDeletePreset={handleDeletePreset}
                hasChanges={preset.hasChanges}
                isSaving={preset.isSaving}
                onSave={preset.save}
                onReset={preset.reset}
            />

            {isInitialLoading && <Loader active inline="centered" style={{ marginTop: "2rem" }} />}

            {!isInitialLoading && selectedPresetId === null && (
                <Message info icon>
                    <Icon name="inbox" />
                    <Message.Content>
                        <Message.Header>Пресет не выбран</Message.Header>
                        Выберите пресет из списка или создайте новый.
                    </Message.Content>
                </Message>
            )}

            {!isInitialLoading && selectedPresetId !== null && (
                <Grid stackable>
                    <Grid.Column width={4}>
                        <ConfigCategoryMenu
                            categories={categories}
                            schema={schema}
                            activeCategory={activeCategory}
                            onCategoryChange={setActiveCategory}
                            searchQuery={search.searchQuery}
                            onSearchChange={search.setSearchQuery}
                            searchLower={search.searchLower}
                            matchCountByCategory={search.matchCountByCategory}
                        />
                    </Grid.Column>

                    <Grid.Column width={12}>
                        <ConfigContentArea
                            activeCategory={activeCategory}
                            schema={schema}
                            values={preset.values}
                            slots={preset.slots}
                            bnets={preset.bnets}
                            searchLower={search.searchLower}
                            matchingProps={search.matchingProps}
                            isLoading={preset.isLoading}
                            onPropertyChange={preset.handlePropertyChange}
                            onPropertyDelete={preset.handlePropertyDelete}
                            onSlotsChange={preset.handleSlotsChange}
                            onBnetsChange={preset.handleBnetsChange}
                        />
                    </Grid.Column>
                </Grid>
            )}

            <NewPresetModal
                open={newPresetOpen}
                onClose={() => setNewPresetOpen(false)}
                onConfirm={handleCreatePreset}
            />
        </Container>
    );
}

export default ConfigSettingsPage;
