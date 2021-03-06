import { SyntheticEvent, useState } from "react";
import { Form } from "semantic-ui-react";
import type { FiltersProps } from "./interfaces";

const orderOptions = [
  { key: "0", text: "Возрастанию", value: "asc" },
  { key: "1", text: "Убыванию", value: "desc" },
];

export const Filters: React.FC<FiltersProps> = ({ onFitlerChange }) => {
  const [verified, setVerified] = useState<boolean>();
  const [minPlayers, setMinPlayers] = useState<number>();
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const [orderBy, setOrderBy] = useState<string>(orderOptions[0].value);

  const onSumbit = (ev: SyntheticEvent) =>
    onFitlerChange({
      verify: verified,
      minPlayers,
      maxPlayers,
      orderBy,
    });

  return (
    <Form>
      <Form.Input
        label="Игроков больше чем"
        type="number"
        value={minPlayers}
        max={32}
        min={0}
        onChange={({ target: { value } }) => setMinPlayers(Number(value))}
      />
      <Form.Input
        label="Игроков меньше чем"
        type="number"
        value={maxPlayers}
        max={32}
        min={0}
        onChange={({ target: { value } }) => setMaxPlayers(Number(value))}
      />
      <Form.Checkbox
        label="Верифицированные карты"
        checked={verified}
        onChange={() => setVerified(!verified)}
      />
      <Form.Select
        fluid
        label="Сортировка по"
        options={orderOptions}
        value={orderBy}
        onChange={(_, data) => setOrderBy(String(data.value))}
      />
      <Form.Button type="button" onClick={onSumbit}>
        Применить фильры
      </Form.Button>
    </Form>
  );
};
