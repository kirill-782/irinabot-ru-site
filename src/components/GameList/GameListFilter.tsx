import React from "react";
import { memo, useEffect } from "react";
import ReactSlider from "react-slider";
import { Button, Form } from "semantic-ui-react";
import { FilterSettings } from "../../hooks/useGameListFilter";
import "./GameListFilter.scss";

const options = [
  {
    key: "default",
    text: "По умолчанию",
    value: "default",
  },
  {
    key: "freeSlots",
    text: "Свободно слотов",
    value: "freeSlots",
  },
  {
    key: "allSlots",
    text: "Всего слотов",
    value: "allSlots",
  },
  {
    key: "playerSlots",
    text: "Игроков в игре",
    value: "playerSlots",
  },
];

interface GameListFilterProps {
  filterSettings: FilterSettings;
  onFilterChange: (filterState: FilterSettings) => void;
  disabledFilters: string[];
}

function GameListFilter({
  filterSettings,
  onFilterChange,
  disabledFilters,
}: GameListFilterProps) {
  return (
    <>
      <Form className="sidebar-filter">
        <Form.Checkbox
          label="Не загружать начатые игры"
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
          name="onlySelfGames"
          disabled={disabledFilters.indexOf("onlySelfGames") > -1}
          checked={filterSettings.onlySelfGames}
          onChange={(event, data) => {
            onFilterChange({
              ...filterSettings,
              onlySelfGames: !!data.checked,
            });
          }}
          label="Только мои игры"
        ></Form.Checkbox>
        <Form.Group grouped>
          <label>Игры по типу</label>
          <Form.Field
            label="Только обычные игры"
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
            label="Все игры"
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
            label="Игры с переопределением позиции"
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
            options={options}
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
          <label>Фильтр по игрокам в лобби</label>
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
            renderThumb={(props, state) => (
              <div {...props}>{state.valueNow}</div>
            )}
          />
        </Form.Field>
        <Form.Field>
          <label>Фильтр по свободным слотам</label>
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
            renderThumb={(props, state) => (
              <div {...props}>{state.valueNow}</div>
            )}
            renderTrack={
              (props, state) => (
                <div {...props}></div>
              )
            }
          />
        </Form.Field>
        <Form.Field>
          <label>Фильтр по числу слотов</label>
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
            renderThumb={(props, state) => (
              <div {...props}>{state.valueNow}</div>
            )}
          />
        </Form.Field>
      </Form>
    </>
  );
}

export default memo(GameListFilter);
