import React, { memo } from "react";
import { useEffect, useState, useContext } from "react";
import ReactSlider from "react-slider";
import {
  Container,
  DropdownItemProps,
  DropdownProps,
  Form,
  Grid,
  GridRow,
} from "semantic-ui-react";
import { RestContext } from "../../context";
import { SearchFilters } from "../../models/rest/SearchFilters";

const sortOptions = [
  { key: "0", text: "(по умолчанию)", value: "default" },
  { key: "1", text: "Имя карты", value: "mapNameEscaped" },
  { key: "2", text: "Дата загрузки", value: "creationDate" },
  { key: "3", text: "Дата обновления", value: "lastUpdateDate" },
  { key: "4", text: "Игроков в карте", value: "numPlayers" },
];

const orderOptions = [
  { key: "0", text: "(по умолчанию)", value: "default" },
  { key: "1", text: "По возрастанию", value: "asc" },
  { key: "2", text: "По убыванию", value: "desc" },
];

export interface Filter {
  verify: boolean;
  taggedOnly: boolean;
  minPlayers: number;
  maxPlayers: number;
  sortBy: string;
  orderBy: string;
  category: number;
  owner: string;
}

/** Параметры, принимаемые компонентом фильтра. */
export interface FiltersProps {
  onFitlerChange(filters: SearchFilters | null): void;
  defaultFilters?: Filter;
  value?: SearchFilters | null;
  autoCommit?: boolean;
}

export const MapFilters: React.FC<FiltersProps> = memo(
  ({ onFitlerChange, defaultFilters, value, autoCommit }) => {
    const [verified, setVerified] = useState<boolean>(
      defaultFilters?.verify || false
    );
    const [taggedOnly, setTaggedOnly] = useState<boolean>(
      defaultFilters?.taggedOnly || false
    );
    const [minPlayers, setMinPlayers] = useState<number>(
      defaultFilters?.minPlayers || 1
    );
    const [maxPlayers, setMaxPlayers] = useState<number>(
      defaultFilters?.maxPlayers || 24
    );
    const [sortBy, setSortBy] = useState<string>(
      defaultFilters?.sortBy || "default"
    );
    const [orderBy, setOrderBy] = useState<string>(
      defaultFilters?.orderBy || "default"
    );
    const [selectedCategories, setSelectedCategories] = useState<number>(
      defaultFilters?.category || 0
    );

    const [owner, setOwner] = useState<string>(defaultFilters?.owner || "");

    const [categories, setCategories] = useState<DropdownItemProps[]>([]);

    const { mapsApi } = useContext(RestContext);

    const commitFilters = () => {
      onFitlerChange({
        verify: verified ? true : undefined,
        minPlayers: minPlayers === 1 ? undefined : minPlayers,
        maxPlayers: maxPlayers === 24 ? undefined : maxPlayers,
        sortBy: sortBy === "default" ? undefined : sortBy,
        orderBy: orderBy === "default" ? undefined : orderBy,
        taggedOnly: taggedOnly ? true : undefined,
        category: selectedCategories || undefined,
        owner: owner || undefined,
      });
    };

    useEffect(() => {
      if (value) {
        setVerified(value.verify || false);
        setTaggedOnly(value.taggedOnly || false);
        setMinPlayers(value.minPlayers || 1);
        setMaxPlayers(value.maxPlayers || 24);
        setSortBy(value.sortBy || "default");
        setOrderBy(value.orderBy || "default");
        setSelectedCategories(value.category || 0);
        setOwner(value.owner || "");
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
      categories,
      owner,
    ]);

    const resetFilters = () => {
      if (defaultFilters) {
        setVerified(defaultFilters.verify);
        setTaggedOnly(defaultFilters.taggedOnly);
        setMinPlayers(defaultFilters.minPlayers);
        setMaxPlayers(defaultFilters.maxPlayers);
        setSortBy(defaultFilters.sortBy);
        setOrderBy(defaultFilters.orderBy);
        setSelectedCategories(defaultFilters.category);
      }
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
          onChange={() => setTaggedOnly(!taggedOnly)}
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
        <Form.Input
          fluid
          label="Владелец"
          value={owner}
          onChange={(_, data) => setOwner(data.value)}
          placeholder="8"
        />
        <Form.Group>
          {!autoCommit && (
            <Form.Button
              icon="check"
              color="green"
              title="Применить фильтры"
              onClick={(ev) => {
                ev.preventDefault();
                commitFilters();
              }}
            />
          )}
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
