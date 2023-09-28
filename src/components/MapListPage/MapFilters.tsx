import React, { memo } from "react";
import { useEffect, useState, useContext } from "react";
import ReactSlider from "react-slider";
import { DropdownItemProps, DropdownProps, Form } from "semantic-ui-react";
import { AppRuntimeSettingsContext, CacheContext } from "../../context";
import { SearchFilters } from "../../models/rest/SearchFilters";
import { SearchOrder } from "./../../models/rest/SearchFilters";
import { LanguageRepositoryKeys } from "../../localization/Lang";

interface OptionWithLanguageKey {
    key: string;
    langKey: LanguageRepositoryKeys;
    value: string;
}

const sortOptions = [
    {
        key: "0",
        langKey: "mapFiltersDefault",
        value: "default",
    },
    {
        key: "1",
        langKey: "mapFiltersMapNameSort",
        value: "mapNameEscaped",
    },
    {
        key: "2",
        langKey: "mapFiltersUploadDateSort",
        value: "creationDate",
    },
    {
        key: "3",
        langKey: "mapFiltersUpdateDateSort",
        value: "lastUpdateDate",
    },
    {
        key: "4",
        langKey: "mapFiltersMapPlayersSort",
        value: "numPlayers",
    },
    {
        key: "5",
        langKey: "mapFiltersGamesSort",
        value: "MapStats.monthGames",
    },
    {
        key: "6",
        langKey: "mapFiltersPlayersSort",
        value: "MapStats.monthPlayers",
    },
] as OptionWithLanguageKey[];

const orderOptions = [
    {
        key: "0",
        langKey: "mapFiltersDefault",
        value: "default",
    },
    { key: "1", langKey: "mapFiltersAscOrder", value: "asc" },
    { key: "2", langKey: "mapFiltersDescOrder", value: "desc" },
] as OptionWithLanguageKey[];

export interface Filter {
    verify: boolean;
    taggedOnly: boolean;
    minPlayers: number;
    maxPlayers: number;
    category: number;
    owner: string;
    favoritedOnly: boolean;
}

export interface Order {
    sortBy: string;
    orderBy: string;
}

/** Параметры, принимаемые компонентом фильтра. */
export interface FiltersProps {
    onFitlerChange(filters: [SearchFilters | null, SearchOrder | null]): void;
    defaultFilters?: Filter;
    defaultOrder?: Order;
    value?: [SearchFilters | null, SearchOrder | null];
    autoCommit?: boolean;
}

export const MapFilters: React.FC<FiltersProps> = memo(
    ({ onFitlerChange, defaultFilters, defaultOrder, value, autoCommit }) => {
        const [verified, setVerified] = useState<boolean>(defaultFilters?.verify || false);
        const [taggedOnly, setTaggedOnly] = useState<boolean>(defaultFilters?.taggedOnly || false);
        const [favoriteOnly, setFavoriteOnly] = useState<boolean>(defaultFilters?.favoritedOnly || false);
        const [minPlayers, setMinPlayers] = useState<number>(defaultFilters?.minPlayers || 1);
        const [maxPlayers, setMaxPlayers] = useState<number>(defaultFilters?.maxPlayers || 24);
        const [sortBy, setSortBy] = useState<string>(defaultOrder?.sortBy || "default");
        const [orderBy, setOrderBy] = useState<string>(defaultOrder?.orderBy || "default");
        const [selectedCategories, setSelectedCategories] = useState<number>(defaultFilters?.category || 0);

        const [owner, setOwner] = useState<string>(defaultFilters?.owner || "");

        const [categories, setCategories] = useState<DropdownItemProps[]>([]);

        const cacheContext = useContext(CacheContext);

        useEffect(() => {
            if (cacheContext.cachedCategories.length === 0) cacheContext.cacheCategories();
        }, [cacheContext]);

        const commitFilters = () => {
            onFitlerChange([
                {
                    verify: verified ? true : undefined,
                    minPlayers: minPlayers === 1 ? undefined : minPlayers,
                    maxPlayers: maxPlayers === 24 ? undefined : maxPlayers,

                    taggedOnly: taggedOnly ? true : undefined,
                    category: selectedCategories || undefined,
                    owner: owner || undefined,
                    favorite: favoriteOnly || undefined,
                },
                {
                    sortBy: sortBy === "default" ? undefined : sortBy,
                    orderBy: orderBy === "default" ? undefined : orderBy,
                },
            ]);
        };

        const { language } = useContext(AppRuntimeSettingsContext);
        const lang = language.languageRepository;

        useEffect(() => {
            if (value) {
                if (value[0]) {
                    setVerified(value[0].verify || false);
                    setTaggedOnly(value[0].taggedOnly || false);
                    setMinPlayers(value[0].minPlayers || 1);
                    setMaxPlayers(value[0].maxPlayers || 24);
                    setSelectedCategories(value[0].category || 0);
                    setOwner(value[0].owner || "");
                    setFavoriteOnly(value[0].favorite || false);
                }
                if (value[1]) {
                    setSortBy(value[1].sortBy || "default");
                    setOrderBy(value[1].orderBy || "default");
                }
            }
        }, [value]);

        useEffect(() => {
            if (autoCommit) commitFilters();
        }, [
            autoCommit,
            verified,
            taggedOnly,
            minPlayers,
            maxPlayers,
            sortBy,
            orderBy,
            selectedCategories,
            owner,
            favoriteOnly,
        ]);

        const resetFilters = () => {
            if (defaultFilters) {
                setVerified(defaultFilters.verify);
                setTaggedOnly(defaultFilters.taggedOnly);
                setMinPlayers(defaultFilters.minPlayers);
                setMaxPlayers(defaultFilters.maxPlayers);
                setSelectedCategories(defaultFilters.category);
                setFavoriteOnly(defaultFilters.favoritedOnly);
            } else {
                setVerified(false);
                setTaggedOnly(false);
                setMinPlayers(1);
                setMaxPlayers(24);
                setSelectedCategories(0);
                setFavoriteOnly(false);
            }

            if (defaultOrder) {
                setSortBy(defaultOrder.sortBy);
                setOrderBy(defaultOrder.orderBy);
            } else {
                setSortBy("default");
                setOrderBy("default");
            }
        };

        useEffect(() => {
            setCategories([
                {
                    key: 0,
                    value: 0,
                    text: lang.mapFiltersAny,
                },
                ...cacheContext.cachedCategories.map((el) => ({
                    key: el.id,
                    value: el.id,
                    text: el.name,
                })),
            ]);
        }, [cacheContext.cachedCategories]);

        const handleCategoryChange = (_, { value }: DropdownProps) => {
            setSelectedCategories(value as number);
        };

        return (
            <>
                <Form.Field>
                    <label>{lang.mapFiltersFreeSlotsLabel}</label>
                    <ReactSlider
                        value={[minPlayers, maxPlayers]}
                        onChange={(newValue) => {
                            setMinPlayers(newValue[0]);
                            setMaxPlayers(newValue[1]);
                        }}
                        max={24}
                        min={1}
                        step={1}
                        renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                    />
                </Form.Field>
                <Form.Checkbox
                    label={lang.mapFiltersVerifyOnly}
                    checked={verified}
                    onChange={() => setVerified(!verified)}
                />
                <Form.Checkbox
                    label={lang.mapFiltersTaggedOnly}
                    checked={taggedOnly}
                    onChange={() => setTaggedOnly(!taggedOnly)}
                />
                <Form.Checkbox
                    label={lang.mapFiltersFavoriteOnly}
                    checked={favoriteOnly}
                    onChange={() => setFavoriteOnly(!favoriteOnly)}
                />
                <Form.Select
                    fluid
                    label={lang.mapFiltersSortByLabel}
                    options={sortOptions.map((i) => {
                        // тут костыли какието
                        return { ...i, text: lang[i.langKey] };
                    })}
                    value={sortBy}
                    onChange={(_, data) => setSortBy(String(data.value))}
                />
                <Form.Select
                    fluid
                    label={lang.mapFiltersOrderByLabel}
                    options={orderOptions.map((i) => {
                        return { ...i, text: lang[i.langKey] };
                    })}
                    value={orderBy}
                    onChange={(_, data) => setOrderBy(String(data.value))}
                />
                <Form.Select
                    fluid
                    loading={categories.length === 0}
                    label={lang.mapFiltersCategoryLabel}
                    options={categories}
                    onChange={handleCategoryChange}
                    value={selectedCategories}
                />
                <Form.Input
                    fluid
                    label={lang.mapFiltersOwnerLabel}
                    value={owner}
                    onChange={(_, data) => setOwner(data.value)}
                    placeholder="8"
                />
                <Form.Group>
                    {!autoCommit && (
                        <Form.Button
                            icon="check"
                            color="green"
                            title={lang.mapFiltersApplyFiltersHint}
                            onClick={(ev) => {
                                ev.preventDefault();
                                commitFilters();
                            }}
                        />
                    )}
                    <Form.Button
                        type="button"
                        icon="x"
                        color="red"
                        title={lang.mapFiltersResetFiltersHint}
                        onClick={(ev) => {
                            ev.preventDefault();
                            onFitlerChange([null, null]);
                            resetFilters();
                        }}
                    />
                </Form.Group>
            </>
        );
    }
);
