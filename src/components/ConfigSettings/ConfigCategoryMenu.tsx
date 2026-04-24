import React from "react";
import { Icon, Input, Label, Menu, SemanticICONS } from "semantic-ui-react";
import { ConfigProperty } from "./PropertyField";

const CATEGORY_LABELS: Record<string, string> = {
    general:  "Основные",
    api:      "API",
    balance:  "Баланс",
    watch:    "Наблюдение",
    autohost: "Автохост",
    replay:   "Реплеи",
    ban:      "Баны",
    admin:    "Администрирование",
    vip:      "VIP",
    stats:    "Статистика",
};

const CATEGORY_ICONS: Record<string, string> = {
    general:  "settings",
    api:      "plug",
    balance:  "balance scale",
    watch:    "eye",
    autohost: "server",
    replay:   "video",
    ban:      "ban",
    admin:    "shield",
    vip:      "star",
    stats:    "chart bar",
};

export function categoryIcon(cat: string): SemanticICONS {
    return (CATEGORY_ICONS[cat] ?? "setting") as SemanticICONS;
}

export function categoryLabel(cat: string): string {
    return CATEGORY_LABELS[cat] || cat;
}

interface ConfigCategoryMenuProps {
    categories: string[];
    schema: ConfigProperty[];
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchLower: string;
    matchCountByCategory: Record<string, number>;
}

function ConfigCategoryMenu({
    categories,
    schema,
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    searchLower,
    matchCountByCategory,
}: ConfigCategoryMenuProps) {
    return (
        <>
            <Input
                icon="search"
                placeholder="Поиск параметров..."
                fluid
                value={searchQuery}
                onChange={(_, data) => onSearchChange(data.value)}
                className="config-search"
            />
            <Menu fluid vertical secondary className="config-menu">
                <Menu.Item header className="config-menu-group">
                    <Icon name="cube" />
                    Специальные
                </Menu.Item>
                <Menu.Item
                    active={activeCategory === "slots"}
                    onClick={() => onCategoryChange("slots")}
                >
                    <Icon name="th" />
                    Слоты
                </Menu.Item>
                <Menu.Item
                    active={activeCategory === "bnets"}
                    onClick={() => onCategoryChange("bnets")}
                >
                    <Icon name="globe" />
                    Battle.net
                </Menu.Item>

                <Menu.Item header className="config-menu-group">
                    <Icon name="list" />
                    Свойства
                </Menu.Item>
                {categories.map((cat) => {
                    const total = schema.filter((p) => p.category === cat).length;
                    const matched = matchCountByCategory[cat] || 0;
                    const hasMatch = searchLower && matched > 0;
                    return (
                        <Menu.Item
                            key={cat}
                            active={activeCategory === cat}
                            onClick={() => onCategoryChange(cat)}
                            className={searchLower && !matched ? "config-menu-dimmed" : ""}
                        >
                            <Icon name={categoryIcon(cat)} />
                            {categoryLabel(cat)}
                            {hasMatch ? (
                                <Label size="tiny" circular color="blue">{matched}</Label>
                            ) : (
                                <Label size="tiny" circular>{total}</Label>
                            )}
                        </Menu.Item>
                    );
                })}
            </Menu>
        </>
    );
}

export default ConfigCategoryMenu;
