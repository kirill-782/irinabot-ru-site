import React, { memo } from "react";
import { SyntheticEvent, useEffect, useState, useContext } from "react";
import ReactSlider from "react-slider";
import { DropdownItemProps, DropdownProps, Form } from "semantic-ui-react";
import { RestContext } from "../../context";
import type { FiltersProps } from "./interfaces";

const orderOptions = [
  { key: "0", text: "Возрастанию", value: "asc" },
  { key: "1", text: "Убыванию", value: "desc" },
];

export const Filters: React.FC<FiltersProps> = memo(({ onFitlerChange }) => {
  const [verified, setVerified] = useState<boolean>();
  const [minPlayers, setMinPlayers] = useState<number>(1);
  const [maxPlayers, setMaxPlayers] = useState<number>(24);
  const [orderBy, setOrderBy] = useState<string>(orderOptions[0].value);
  const [categories, setCategories] = useState<DropdownItemProps[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number>();
  const { mapsApi } = useContext(RestContext);

  useEffect(() => {
    mapsApi.getCategories().then((res) =>
      setCategories(
        res.map((el) => ({
          key: el.id,
          value: el.id,
          text: el.name,
          singleton: el.singleton,
        }))
      )
    );
  }, [mapsApi]);

  const onSumbit = (ev: SyntheticEvent) =>
    onFitlerChange({
      verify: verified ? true : undefined,
      minPlayers,
      maxPlayers,
      orderBy,
      category: selectedCategories,
    });

  const handleCategoryChange = (_, { value }: DropdownProps) => {
    setSelectedCategories(value as number);
  };

  return (
    <Form>
      <Form.Field>
        <label>Фильтр по свободным слотам</label>
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
        label="Только верифицированные карты"
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
      <Form.Select
        name="map_genre"
        fluid
        label="Тип карты"
        options={categories}
        onChange={handleCategoryChange}
        value={selectedCategories}
      />
      <Form.Button type="button" onClick={onSumbit}>
        Применить фильры
      </Form.Button>
    </Form>
  );
});
