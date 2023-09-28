import { memo, useContext } from "react";
import { Divider, Form } from "semantic-ui-react";
import { GameOptionsProps } from "./interfaces";
import { invertSelectedBits } from "../../utils/BitMaskUtils";
import React from "react";
import { AppRuntimeSettingsContext } from "../../context";
import { LanguageRepositoryKeys } from "../../localization/Lang";

interface OptionWithLanguageKey {
    key: string;
    langKey: LanguageRepositoryKeys;
    value: number;
}

const visibilityOptions = [
    {
        key: "4",
        langKey: "gameOptionsDefault",
        value: 4,
    },

    { key: "1", langKey: "gameOptionsHidden", value: 1 },
    { key: "2", langKey: "gameOptionsExplored", value: 2 },
    { key: "3", langKey: "gameOptionsOpen", value: 3 },
] as OptionWithLanguageKey[];

const speedOptions = [
    { key: "1", langKey: "gameOptionsSlow", value: 1 },
    { key: "2", langKey: "gameOptionsMedium", value: 2 },
    { key: "3", langKey: "gameOptionsFast", value: 3 },
] as OptionWithLanguageKey[];

const observersOptions = [
    { key: "1", langKey: "gameOptionsNo", value: 1 },
    { key: "3", langKey: "gameOptionsAllObservers", value: 3 },
    { key: "2", langKey: "gameOptionsAfterDefeat", value: 2 },
    { key: "4", langKey: "gameOptionsJudges", value: 4 },
] as OptionWithLanguageKey[];

export const MAP_FLAG_TEAMS_TOGETHER = 1;
export const MAP_FLAG_FIXED_TEAMS = 2;
export const MAP_FLAG_UNIT_SHARE = 4;
export const MAP_FLAG_RANDOM_HERO = 8;
export const MAP_FLAG_RANDOM_RACES = 16;

export const GameOptions: React.FC<GameOptionsProps> = memo(({ options, onOptionsChange }) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    return (
        <>
            <Form.Checkbox
                label={lang.gameOptionsPassword}
                checked={options.privateGame}
                onChange={() => {
                    onOptionsChange({ ...options, privateGame: !options.privateGame });
                }}
            />
            <Form.Input
                label={lang.gameOptionsConfigNameLabel}
                value={options.configName}
                onChange={(_, data) => {
                    onOptionsChange({ ...options, configName: data.value as string });
                }}
            />
            <Divider />
            <Form.Checkbox
                label={lang.gameOptionsTeamsTogether}
                checked={(options.mask & MAP_FLAG_TEAMS_TOGETHER) === MAP_FLAG_TEAMS_TOGETHER}
                onChange={() =>
                    onOptionsChange({
                        ...options,
                        mask: invertSelectedBits(options.mask, MAP_FLAG_TEAMS_TOGETHER),
                    })
                }
            />
            <Form.Checkbox
                label={lang.gameOptionsLockTeams}
                checked={(options.mask & MAP_FLAG_FIXED_TEAMS) === MAP_FLAG_FIXED_TEAMS}
                onChange={() =>
                    onOptionsChange({
                        ...options,
                        mask: invertSelectedBits(options.mask, MAP_FLAG_FIXED_TEAMS),
                    })
                }
            />
            <Form.Checkbox
                label={lang.gameOptionsFullSharedUnitControl}
                checked={(options.mask & MAP_FLAG_UNIT_SHARE) === MAP_FLAG_UNIT_SHARE}
                onChange={() =>
                    onOptionsChange({
                        ...options,
                        mask: invertSelectedBits(options.mask, MAP_FLAG_UNIT_SHARE),
                    })
                }
            />
            <Form.Checkbox
                label={lang.gameOptionsRandomRaces}
                checked={(options.mask & MAP_FLAG_RANDOM_RACES) === MAP_FLAG_RANDOM_RACES}
                onChange={() =>
                    onOptionsChange({
                        ...options,
                        mask: invertSelectedBits(options.mask, MAP_FLAG_RANDOM_RACES),
                    })
                }
            />
            <Form.Checkbox
                label={lang.gameOptionsRandomHeros}
                name="mapFlagRandomHero"
                checked={(options.mask & MAP_FLAG_RANDOM_HERO) === MAP_FLAG_RANDOM_HERO}
                onChange={() =>
                    onOptionsChange({
                        ...options,
                        mask: invertSelectedBits(options.mask, MAP_FLAG_RANDOM_HERO),
                    })
                }
            />
            <Form.Select
                fluid
                name="spectators"
                label={lang.gameOptionsObserversLabel}
                onChange={(_, data) =>
                    onOptionsChange({
                        ...options,
                        mapObservers: data.value as number,
                    })
                }
                options={observersOptions.map((i) => {
                    return { ...i, text: lang[i.langKey] };
                })}
                value={options.mapObservers}
            />
            <Form.Select
                fluid
                name="visibility"
                label={lang.gameOptionsMapVisibilityLabel}
                options={visibilityOptions.map((i) => {
                    return { ...i, text: lang[i.langKey] };
                })}
                onChange={(_, data) =>
                    onOptionsChange({
                        ...options,
                        mapVisibility: data.value as number,
                    })
                }
                value={options.mapVisibility}
            />
            <Form.Select
                fluid
                name="speed"
                label={lang.gameOptionsSpeedLabel}
                options={speedOptions.map((i) => {
                    return { ...i, text: lang[i.langKey] };
                })}
                onChange={(_, data) =>
                    onOptionsChange({
                        ...options,
                        mapSpeed: data.value as number,
                    })
                }
                value={options.mapSpeed}
            />
        </>
    );
});
