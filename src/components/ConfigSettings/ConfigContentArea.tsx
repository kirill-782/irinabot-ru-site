import React, { useMemo } from "react";
import { Dimmer, Form, Header, Icon, Loader, Message, Segment } from "semantic-ui-react";
import { ConfigProperty, PropertyField } from "./PropertyField";
import { categoryIcon, categoryLabel } from "./ConfigCategoryMenu";
import SlotsSection from "./SlotsSection";
import BnetsSection from "./BnetsSection";
import { HostPresetBnets, HostPresetSlots } from "../../models/rest/HostPreset";

interface ConfigContentAreaProps {
    activeCategory: string;
    schema: ConfigProperty[];
    values: Record<string, any>;
    slots: HostPresetSlots;
    bnets: HostPresetBnets;
    searchLower: string;
    matchingProps: Set<string>;
    isLoading: boolean;
    onPropertyChange: (name: string, value: any) => void;
    onPropertyDelete: (name: string) => void;
    onSlotsChange: (slots: HostPresetSlots) => void;
    onBnetsChange: (bnets: HostPresetBnets) => void;
}

function ConfigContentArea({
    activeCategory,
    schema,
    values,
    slots,
    bnets,
    searchLower,
    matchingProps,
    isLoading,
    onPropertyChange,
    onPropertyDelete,
    onSlotsChange,
    onBnetsChange,
}: ConfigContentAreaProps) {
    const isSpecialSection = activeCategory === "slots" || activeCategory === "bnets";

    const categoryProperties = useMemo(
        () => schema.filter((p) => p.category === activeCategory),
        [activeCategory, schema]
    );

    const headerIcon =
        activeCategory === "slots"
            ? "th"
            : activeCategory === "bnets"
            ? "globe"
            : categoryIcon(activeCategory);

    const headerTitle =
        activeCategory === "slots"
            ? "Слоты"
            : activeCategory === "bnets"
            ? "Battle.net"
            : categoryLabel(activeCategory);

    return (
        <Segment className="config-content">
            <Dimmer active={isLoading} inverted>
                <Loader>Загрузка пресета...</Loader>
            </Dimmer>

            <Header as="h3" dividing>
                <Icon name={headerIcon} />
                <Header.Content>{headerTitle}</Header.Content>
            </Header>

            {activeCategory === "slots" && (
                <SlotsSection slots={slots} onSlotsChange={onSlotsChange} />
            )}

            {activeCategory === "bnets" && (
                <BnetsSection bnets={bnets} onBnetsChange={onBnetsChange} />
            )}

            {!isSpecialSection && (
                <Form className="config-section">
                    {categoryProperties.map((prop) => {
                        const isMatch = matchingProps.has(prop.name);
                        const isDimmed = searchLower && !isMatch;
                        return (
                            <div
                                key={prop.name}
                                className={
                                    isMatch
                                        ? "config-field-highlight"
                                        : isDimmed
                                        ? "config-field-dimmed"
                                        : ""
                                }
                            >
                                <PropertyField
                                    property={prop}
                                    value={values[prop.name]}
                                    onChange={onPropertyChange}
                                    onDelete={onPropertyDelete}
                                />
                            </div>
                        );
                    })}
                    {categoryProperties.length === 0 && (
                        <Message info>Нет свойств в этой категории.</Message>
                    )}
                </Form>
            )}
        </Segment>
    );
}

export default ConfigContentArea;
