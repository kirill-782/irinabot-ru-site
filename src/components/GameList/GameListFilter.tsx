import { Button, Form } from "semantic-ui-react";
import { Slider } from "react-semantic-ui-range";
import { FilterSettings } from "../../hooks/useGameListFilter";

const settings = {
  start: [1, 24],
  min: 1,
  max: 24,
  step: 1,
  onChange: (e, v) => {
    console.log(e, v);
  },
};

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
}

function GameListFilter({
  filterSettings,
  onFilterChange,
}: GameListFilterProps) {
  return (
    <>
      <Form>
        <Form.Checkbox
          label="Не загружать начатые игры"
          checked={filterSettings.noLoadStarted}
          onChange={(event, data) => {
            onFilterChange({
              ...filterSettings,
              noLoadStarted: data.checked,
            });
          }}
        ></Form.Checkbox>
        <Form.Checkbox
          checked={filterSettings.onlySelfGames}
          onChange={(event, data) => {
            onFilterChange({
              ...filterSettings,
              onlySelfGames: data.checked,
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
            checked={filterSettings.gameType === 2}
            onChange={(event, data) => {
              onFilterChange({
                ...filterSettings,
                gameType: 2,
              });
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Dropdown
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
            color={filterSettings.reverseOrder ? "green" : null}
            onClick={() =>
              onFilterChange({
                ...filterSettings,
                reverseOrder: !filterSettings.reverseOrder,
              })
            }
          />
        </Form.Group>

        <Form.Field>
          <label>Фильтр по игрокам в лобби</label>
          <Slider multiple discrete color="red" settings={settings} />
        </Form.Field>
        <Form.Field>
          <label>Фильтр по свободным слотам</label>
          <Slider multiple discrete color="red" settings={settings} />
        </Form.Field>
        <Form.Field>
          <label>Фильтр по числу слотов</label>
          <Slider multiple discrete color="red" settings={settings} />
        </Form.Field>
      </Form>
    </>
  );
}

export default GameListFilter;
