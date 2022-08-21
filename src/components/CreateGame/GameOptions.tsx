import { memo } from "react";
import { Divider, Form } from "semantic-ui-react";
import { GameOptionsProps } from "./interfaces";
import { invertSelectedBits } from "../../utils/BitMaskUtils";
import React from "react";

const visibilityOptions = [
  { key: "4", text: "По умочланию", value: 4 },
  { key: "1", text: "Скрыта", value: 1 },
  { key: "2", text: "Разведана", value: 2 },
  { key: "3", text: "Открыта", value: 3 },
];

const speedOptions = [
  { key: "1", text: "Медленно", value: 1 },
  { key: "2", text: "Средне", value: 2 },
  { key: "3", text: "Быстро", value: 3 },
];

const observersOptions = [
  { key: "1", text: "Нет", value: 1 },
  { key: "3", text: "Все зрители", value: 3 },
  { key: "2", text: "После поражения", value: 2 },
  { key: "4", text: "Судьи", value: 4 },
];

export const MAP_FLAG_TEAMS_TOGETHER = 1;
export const MAP_FLAG_FIXED_TEAMS = 2;
export const MAP_FLAG_UNIT_SHARE = 4;
export const MAP_FLAG_RANDOM_HERO = 8;
export const MAP_FLAG_RANDOM_RACES = 16;

export const GameOptions: React.FC<GameOptionsProps> = memo(
  ({ options, onOptionsChange }) => {
    return (
      <>
        <Form.Checkbox
          label="Вход по паролю (будет выдан после создания игры)"
          name="enter-with-password"
          checked={options.privateGame}
          onChange={() => {
            onOptionsChange({ ...options, privateGame: !options.privateGame });
          }}
        />
        <Divider />
        <Form.Checkbox
          label="Города союзников рядом"
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
          label="Фиксация кланов"
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
          label="Общие войска"
          checked={(options.mask & MAP_FLAG_UNIT_SHARE) === MAP_FLAG_UNIT_SHARE}
          onChange={() =>
            onOptionsChange({
              ...options,
              mask: invertSelectedBits(options.mask, MAP_FLAG_UNIT_SHARE),
            })
          }
        />
        <Form.Checkbox
          label="Случайные расы"
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
          label="Случайные герои"
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
          label="Зрители"
          onChange={(_, data) =>
            onOptionsChange({
              ...options,
              mapObservers: data.value as number,
            })
          }
          options={observersOptions}
          value={options.mapObservers}
        />
        <Form.Select
          fluid
          name="visibility"
          label="Карта"
          options={visibilityOptions}
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
          label="Скорость"
          options={speedOptions}
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
