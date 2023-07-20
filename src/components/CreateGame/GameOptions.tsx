import { memo, useContext } from "react";
import { Divider, Form } from "semantic-ui-react";
import { GameOptionsProps } from "./interfaces";
import { invertSelectedBits } from "../../utils/BitMaskUtils";
import React from "react";
import { AppRuntimeSettingsContext } from "../../context";

const visibilityOptions = [
  { key: "4", text: "page.game.options.visibility.default", value: 4 },
  { key: "1", text: "page.game.options.visibility.masked", value: 1 },
  { key: "2", text: "page.game.options.visibility.explored", value: 2 },
  { key: "3", text: "page.game.options.visibility.open", value: 3 },
];

const speedOptions = [
  { key: "1", text: "page.game.options.gamespeed.slow", value: 1 },
  { key: "2", text: "page.game.options.gamespeed.norm", value: 2 },
  { key: "3", text: "page.game.options.gamespeed.fast", value: 3 },
];

const observersOptions = [
  { key: "1", text: "page.game.options.observers.none", value: 1 },
  { key: "3", text: "page.game.options.observers.all", value: 3 },
  { key: "2", text: "page.game.options.observers.after", value: 2 },
  { key: "4", text: "page.game.options.observers.referees", value: 4 },
];

export const MAP_FLAG_TEAMS_TOGETHER = 1;
export const MAP_FLAG_FIXED_TEAMS = 2;
export const MAP_FLAG_UNIT_SHARE = 4;
export const MAP_FLAG_RANDOM_HERO = 8;
export const MAP_FLAG_RANDOM_RACES = 16;

export const GameOptions: React.FC<GameOptionsProps> = memo(
  ({ options, onOptionsChange }) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    return (
      <>
        <Form.Checkbox
          label={lang.needPassword}
          checked={options.privateGame}
          onChange={() => {
            onOptionsChange({ ...options, privateGame: !options.privateGame });
          }}
        />
        <Form.Input
          label={lang.page_game_options_configName}
          value={options.configName}
          onChange={(_, data) => {
            onOptionsChange({ ...options, configName: data.value as string });
          }}
        />
        <Divider />
        <Form.Checkbox
          label={lang.teamsTogether}
          checked={
            (options.mask & MAP_FLAG_TEAMS_TOGETHER) === MAP_FLAG_TEAMS_TOGETHER
          }
          onChange={() =>
            onOptionsChange({
              ...options,
              mask: invertSelectedBits(options.mask, MAP_FLAG_TEAMS_TOGETHER),
            })
          }
        />
        <Form.Checkbox
          label={lang.fixedTeams}
          checked={
            (options.mask & MAP_FLAG_FIXED_TEAMS) === MAP_FLAG_FIXED_TEAMS
          }
          onChange={() =>
            onOptionsChange({
              ...options,
              mask: invertSelectedBits(options.mask, MAP_FLAG_FIXED_TEAMS),
            })
          }
        />
        <Form.Checkbox
          label={lang.unitShare}
          checked={(options.mask & MAP_FLAG_UNIT_SHARE) === MAP_FLAG_UNIT_SHARE}
          onChange={() =>
            onOptionsChange({
              ...options,
              mask: invertSelectedBits(options.mask, MAP_FLAG_UNIT_SHARE),
            })
          }
        />
        <Form.Checkbox
          label={lang.randomRaces}
          checked={
            (options.mask & MAP_FLAG_RANDOM_RACES) === MAP_FLAG_RANDOM_RACES
          }
          onChange={() =>
            onOptionsChange({
              ...options,
              mask: invertSelectedBits(options.mask, MAP_FLAG_RANDOM_RACES),
            })
          }
        />
        <Form.Checkbox
          label={lang.randomHero}
          name="mapFlagRandomHero"
          checked={
            (options.mask & MAP_FLAG_RANDOM_HERO) === MAP_FLAG_RANDOM_HERO
          }
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
          label={lang.page_game_options_mapObservers}
          onChange={(_, data) =>
            onOptionsChange({
              ...options,
              mapObservers: data.value as number,
            })
          }
          options={observersOptions.map((i) => {
            return { ...i, text: t(i.text) };
          })}
          value={options.mapObservers}
        />
        <Form.Select
          fluid
          name="visibility"
          label={lang.page_game_options_map}
          options={visibilityOptions.map((i) => {
            return { ...i, text: t(i.text) };
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
          label={lang.speed}
          options={speedOptions.map((i) => {
            return { ...i, text: t(i.text) };
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
  }
);
