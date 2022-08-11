import React, { memo } from "react";
import { useEffect, useState, useContext } from "react";
import ReactSlider from "react-slider";
import { DropdownItemProps, DropdownProps, Form } from "semantic-ui-react";
import { RestContext } from "../../context";
import { SearchFilters } from "../../models/rest/SearchFilters";

const sortOptions = [
  { key: "0", text: "Имя карты", value: "mapNameEscaped" },
  { key: "1", text: "Дата загрузки", value: "creationDate" },
  { key: "2", text: "Дата обновления", value: "lastUpdateDate" },
  { key: "3", text: "Игроков в карте", value: "numPlayers" },
];

const orderOptions = [
  { key: "0", text: "По возрастанию", value: "asc" },
  { key: "1", text: "По убыванию", value: "desc" },
];

export interface Filter {
  verify: boolean;
  taggedOnly: boolean;
  minPlayers: number;
  maxPlayers: number;
  sortBy: string;
  orderBy: string;
  category: number;
}

/** Параметры, принимаемые компонентом фильтра. */
export interface FiltersProps {
  onFitlerChange(filters: SearchFilters | null): void;
  defaultFilters: Filter;
  value?: Filter;
}

export const MapFilters: React.FC<FiltersProps> = memo(
  ({ onFitlerChange, defaultFilters, value }) => {
    const [verified, setVerified] = useState<boolean>(defaultFilters.verify);
    const [taggedOnly, setTaggedOnly] = useState<boolean>(
      defaultFilters.taggedOnly
    );
    const [minPlayers, setMinPlayers] = useState<number>(
      defaultFilters.minPlayers
    );
    const [maxPlayers, setMaxPlayers] = useState<number>(
      defaultFilters.maxPlayers
    );
    const [sortBy, setSortBy] = useState<string>(defaultFilters.sortBy);
    const [orderBy, setOrderBy] = useState<string>(defaultFilters.orderBy);
    const [selectedCategories, setSelectedCategories] = useState<number>(
      defaultFilters.category
    );

    const [categories, setCategories] = useState<DropdownItemProps[]>([]);

    const { mapsApi } = useContext(RestContext);

    useEffect(() => {
      if (value) {
        setVerified(value.verify);
        setTaggedOnly(value.taggedOnly);
        setMinPlayers(value.minPlayers);
        setMaxPlayers(value.maxPlayers);
        setSortBy(value.sortBy);
        setOrderBy(value.orderBy);
        setSelectedCategories(value.category);
      }
    }, [value]);

    const resetFilters = () => {
      setVerified(defaultFilters.verify);
      setTaggedOnly(defaultFilters.taggedOnly);
      setMinPlayers(defaultFilters.minPlayers);
      setMaxPlayers(defaultFilters.maxPlayers);
      setSortBy(defaultFilters.sortBy);
      setOrderBy(defaultFilters.orderBy);
      setSelectedCategories(defaultFilters.category);
    };

    useEffect(() => {
      mapsApi.getCategories().then((res) => {
        setCategories([
          {
            key: 0,
            value: 0,
            text: "(любая)",
          },
          ...res.map((el) => ({
            key: el.id,
            value: el.id,
            text: el.name,
          })),
        ]);
      });
    }, [mapsApi]);

    const handleCategoryChange = (_, { value }: DropdownProps) => {
      setSelectedCategories(value as number);
    };

    return (
      <>
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
            renderThumb={(props, state) => (
              <div {...props}>{state.valueNow}</div>
            )}
          />
        </Form.Field>
        <Form.Checkbox
          label="Только верифицированные карты"
          checked={verified}
          onChange={() => setVerified(!verified)}
        />
        <Form.Checkbox
          label="Только отмеченные карты"
          checked={taggedOnly}
          onChange={() => setTaggedOnly(!verified)}
        />
        <Form.Select
          fluid
          label="Сортировка по"
          options={sortOptions}
          value={sortBy}
          onChange={(_, data) => setSortBy(String(data.value))}
        />
        <Form.Select
          fluid
          label="Порядок сортировки"
          options={orderOptions}
          value={orderBy}
          onChange={(_, data) => setOrderBy(String(data.value))}
        />
        <Form.Select
          fluid
          loading={categories.length == 0}
          label="Тип карты"
          options={categories}
          onChange={handleCategoryChange}
          value={selectedCategories}
        />
        <Form.Group>
          <Form.Button
            icon="check"
            color="green"
            title="Применить фильтры"
            onClick={(ev) => {
              ev.preventDefault();
              onFitlerChange({
                verify: verified ? true : undefined,
                minPlayers,
                maxPlayers,
                sortBy,
                orderBy,
                taggedOnly,
                category: selectedCategories || undefined,
              });
            }}
          />
          <Form.Button
            icon="x"
            color="red"
            title="Сбросить фильтры"
            onClick={(ev) => {
              ev.preventDefault();
              onFitlerChange(null);
              resetFilters();
            }}
          />
        </Form.Group>
      </>
    );
  }
);
