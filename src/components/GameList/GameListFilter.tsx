import React, { useContext, useEffect, useState } from "react";
import { memo } from "react";
import ReactSlider from "react-slider";
import { Button, Dropdown, DropdownItemProps, Form } from "semantic-ui-react";
import { AppRuntimeSettingsContext, CacheContext } from "../../context";
import { FilterSettings } from "../../hooks/useGameListFilter";
import "./GameListFilter.scss";
import { DropdownItemPropsConfirmExtends } from "../Pages/CreateGameConfirmPage";

const options = [
    {
        key: "default",
        langKey: "gameListFilterSortDefault",
        value: "default",
    },
    {
        key: "freeSlots",
        langKey: "gameListFilterSortFreeSlots",
        value: "freeSlots",
    },
    {
        key: "allSlots",
        langKey: "gameListFilterSortAllSlots",
        value: "allSlots",
    },
    {
        key: "playerSlots",
        langKey: "gameListFilterSortPlayers",
        value: "playerSlots",
    },
];

export interface GameListFilterProps {
    filterSettings: FilterSettings;
    onFilterChange: (filterState: FilterSettings) => void;
    disabledFilters: string[];
}

function GameListFilter({ filterSettings, onFilterChange, disabledFilters }: GameListFilterProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const runtimeContext = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const [configPatches, setConfigPatches] = useState<DropdownItemProps[]>([]);

    const cache = useContext(CacheContext);

    useEffect(() => {
        if (cache.cachedVersions.length === 0) cache.cacheVersions();
    }, [cache]);

    useEffect(() => {
        setConfigPatches(
            cache.cachedVersions.map((i) => {
                return {
                    text: i,
                    value: i,
                    content: i,
                };
            })
        );
    }, [cache.cachedVersions]);

    return (
        <>
            <Form className="sidebar-filter">
                <Form.Checkbox
                    label={lang.gameListFilterNoLoadStartGames}
                    checked={filterSettings.noLoadStarted}
                    name="noLoadStarted"
                    disabled={disabledFilters.indexOf("noLoadStarted") > -1}
                    onChange={(event, data) => {
                        onFilterChange({
                            ...filterSettings,
                            noLoadStarted: !!data.checked,
                        });
                    }}
                ></Form.Checkbox>
                <Form.Checkbox
                    label={lang.gameListFilterForceReorder}
                    checked={filterSettings.forceReorder}
                    name="forceReorder"
                    disabled={disabledFilters.indexOf("forceReorder") > -1}
                    onChange={(event, data) => {
                        onFilterChange({
                            ...filterSettings,
                            forceReorder: !!data.checked,
                        });
                    }}
                ></Form.Checkbox>
                <Form.Checkbox
                    label={lang.gameListFilterOnlySelfGames}
                    name="onlySelfGames"
                    disabled={disabledFilters.indexOf("onlySelfGames") > -1}
                    checked={filterSettings.onlySelfGames}
                    onChange={(event, data) => {
                        onFilterChange({
                            ...filterSettings,
                            onlySelfGames: !!data.checked,
                        });
                    }}
                ></Form.Checkbox>
                <Form.Checkbox
                    label={lang.gameListFilterOnlyFavoriteMaps}
                    name="onlyFavoritedMaps"
                    disabled={disabledFilters.indexOf("onlyFavoritedMaps") > -1}
                    checked={filterSettings.onlyFavoritedMaps}
                    onChange={(event, data) => {
                        onFilterChange({
                            ...filterSettings,
                            onlyFavoritedMaps: !!data.checked,
                        });
                    }}
                ></Form.Checkbox>
                <Form.Field>
                    <Button
                        basic
                        icon="copy"
                        size="large"
                        color={runtimeContext.linkCopyMode.copy ? "green" : undefined}
                        onClick={() => {
                            runtimeContext.linkCopyMode.setCopy((copy) => !copy);
                        }}
                    />
                </Form.Field>
                <Form.Field>
                    <label>{lang.gameListFilterHiddenPatchLabel}</label>
                    <Dropdown
                        placeholder={lang.gameListFilterHiddenPatchPlaceholder}
                        fluid
                        multiple
                        selection
                        options={configPatches}
                        value={filterSettings.hiddenPatch}
                        selectedLabel=""
                        onChange={(event, data) => {
                            onFilterChange({
                                ...filterSettings,
                                hiddenPatch: data.value as string[],
                            });
                        }}
                    />
                </Form.Field>
                <Form.Group grouped>
                    <label>{lang.gameListFilterGameTypeLabel}</label>
                    <Form.Field
                        label={lang.gameListFilterPlainGamesOnly}
                        control="input"
                        type="radio"
                        name="gameType"
                        disabled={disabledFilters.indexOf("gameType") > -1}
                        checked={filterSettings.gameType === 1}
                        onChange={(event, data) => {
                            onFilterChange({
                                ...filterSettings,
                                gameType: 1,
                            });
                        }}
                    />
                    <Form.Field
                        label={lang.gameListFilterAllGames}
                        control="input"
                        type="radio"
                        name="gameType"
                        disabled={disabledFilters.indexOf("gameType") > -1}
                        checked={filterSettings.gameType === 0}
                        onChange={(event, data) => {
                            onFilterChange({
                                ...filterSettings,
                                gameType: 0,
                            });
                        }}
                    />
                    <Form.Field
                        label={lang.gameListFilterNonPlainOnly}
                        control="input"
                        type="radio"
                        name="gameType"
                        disabled={disabledFilters.indexOf("gameType") > -1}
                        checked={filterSettings.gameType === 2}
                        onChange={(event, data) => {
                            onFilterChange({
                                ...filterSettings,
                                gameType: 2,
                            });
                        }}
                    />
                </Form.Group>
                <Form.Group className="order-filter">
                    <Form.Dropdown
                        name="orderBy"
                        className="order-filter-select"
                        disabled={disabledFilters.indexOf("orderBy") > -1}
                        onChange={(event, data) =>
                            onFilterChange({
                                ...filterSettings,
                                orderBy: data.value as string,
                            })
                        }
                        button
                        basic
                        floating
                        options={options.map((i) => {
                            return { ...i, text: lang[i.langKey] };
                        })}
                        value={filterSettings.orderBy}
                    />
                    <Button
                        floated="right"
                        basic
                        icon="exchange"
                        name="reverseOrder"
                        disabled={disabledFilters.indexOf("reverseOrder") > -1}
                        color={filterSettings.reverseOrder ? "green" : undefined}
                        onClick={() =>
                            onFilterChange({
                                ...filterSettings,
                                reverseOrder: !filterSettings.reverseOrder,
                            })
                        }
                    />
                </Form.Group>

                <Form.Field className="players-filter">
                    <label>{lang.gameListFilterPlayerFilterLabel}</label>
                    <ReactSlider
                        value={filterSettings.players}
                        onChange={(newValue) => {
                            onFilterChange({
                                ...filterSettings,
                                players: newValue,
                            });
                        }}
                        max={24}
                        min={0}
                        step={1}
                        renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                    />
                </Form.Field>
                <Form.Field>
                    <label>{lang.gameListFilterFreeSlotsFilterLabel}</label>
                    <ReactSlider
                        value={filterSettings.freeSlots}
                        onChange={(newValue) => {
                            onFilterChange({
                                ...filterSettings,
                                freeSlots: newValue,
                            });
                        }}
                        max={24}
                        min={0}
                        step={1}
                        renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                        renderTrack={(props, state) => <div {...props}></div>}
                    />
                </Form.Field>
                <Form.Field>
                    <label>{lang.gameListFilterAllSlotsFilterLabel}</label>
                    <ReactSlider
                        value={filterSettings.slots}
                        onChange={(newValue) => {
                            onFilterChange({
                                ...filterSettings,
                                slots: newValue,
                            });
                        }}
                        max={24}
                        min={0}
                        step={1}
                        renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                    />
                </Form.Field>
            </Form>
        </>
    );
}

export default memo(GameListFilter);
