import React, { memo } from "react";
import { useEffect, useState, useContext } from "react";
import ReactSlider from "react-slider";
import { DropdownItemProps, DropdownProps, Form } from "semantic-ui-react";
import { CacheContext } from "../../context";
import { SearchFilters } from "../../models/rest/SearchFilters";
import { SearchOrder } from "./../../models/rest/SearchFilters";

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
  category: number;
  owner: string;
  favoritedOnly: boolean;
}

export interface Order {
  sortBy: string;
  orderBy: string;
}

/** Параметры, принимаемые компонентом фильтра. */
export interface FiltersProps {
  onFitlerChange(filters: [SearchFilters | null, SearchOrder | null]): void;
  defaultFilters?: Filter;
  defaultOrder?: Order;
  value?: [SearchFilters | null, SearchOrder | null];
  autoCommit?: boolean;
}

export const MapFilters: React.FC<FiltersProps> = memo(
  ({ onFitlerChange, defaultFilters, defaultOrder, value, autoCommit }) => {
    const [verified, setVerified] = useState<boolean>(
      defaultFilters?.verify || false
    );
    const [taggedOnly, setTaggedOnly] = useState<boolean>(
      defaultFilters?.taggedOnly || false
    );
    const [favoriteOnly, setFavoriteOnly] = useState<boolean>(
      defaultFilters?.favoritedOnly || false
    );
    const [minPlayers, setMinPlayers] = useState<number>(
      defaultFilters?.minPlayers || 1
    );
    const [maxPlayers, setMaxPlayers] = useState<number>(
      defaultFilters?.maxPlayers || 24
    );
    const [sortBy, setSortBy] = useState<string>(
      defaultOrder?.sortBy || "default"
    );
    const [orderBy, setOrderBy] = useState<string>(
      defaultOrder?.orderBy || "default"
    );
    const [selectedCategories, setSelectedCategories] = useState<number>(
      defaultFilters?.category || 0
    );

    const [owner, setOwner] = useState<string>(defaultFilters?.owner || "");

    const [categories, setCategories] = useState<DropdownItemProps[]>([]);

    const cacheContext = useContext(CacheContext);

    useEffect(() => {
      if (cacheContext.cachedCategories.length === 0)
        cacheContext.cacheCategories();
    }, [cacheContext]);

    const commitFilters = () => {
      onFitlerChange([
        {
          verify: verified ? true : undefined,
          minPlayers: minPlayers === 1 ? undefined : minPlayers,
          maxPlayers: maxPlayers === 24 ? undefined : maxPlayers,

          taggedOnly: taggedOnly ? true : undefined,
          category: selectedCategories || undefined,
          owner: owner || undefined,
          favorite: favoriteOnly || undefined,
        },
        {
          sortBy: sortBy === "default" ? undefined : sortBy,
          orderBy: orderBy === "default" ? undefined : orderBy,
        },
      ]);
    };

    useEffect(() => {
      if (value) {
        if (value[0]) {
          setVerified(value[0].verify || false);
          setTaggedOnly(value[0].taggedOnly || false);
          setMinPlayers(value[0].minPlayers || 1);
          setMaxPlayers(value[0].maxPlayers || 24);
          setSelectedCategories(value[0].category || 0);
          setOwner(value[0].owner || "");
          setFavoriteOnly(value[0].favorite || false);
        }
        if (value[1]) {
          setSortBy(value[1].sortBy || "default");
          setOrderBy(value[1].orderBy || "default");
        }
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
      owner,
      favoriteOnly,
    ]);

    const resetFilters = () => {
      if (defaultFilters) {
        setVerified(defaultFilters.verify);
        setTaggedOnly(defaultFilters.taggedOnly);
        setMinPlayers(defaultFilters.minPlayers);
        setMaxPlayers(defaultFilters.maxPlayers);
        setSelectedCategories(defaultFilters.category);
        setFavoriteOnly(defaultFilters.favoritedOnly);
      } else {
        setVerified(false);
        setTaggedOnly(false);
        setMinPlayers(1);
        setMaxPlayers(24);
        setSelectedCategories(0);
        setFavoriteOnly(false);
      }

      if (defaultOrder) {
        setSortBy(defaultOrder.sortBy);
        setOrderBy(defaultOrder.orderBy);
      } else {
        setSortBy("default");
        setOrderBy("default");
      }
    };

    useEffect(() => {
      setCategories([
        {
          key: 0,
          value: 0,
          text: "(любая)",
        },
        ...cacheContext.cachedCategories.map((el) => ({
          key: el.id,
          value: el.id,
          text: el.name,
        })),
      ]);
    }, [cacheContext.cachedCategories]);

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
        <Form.Checkbox
          label="Только избранные карты"
          checked={favoriteOnly}
          onChange={() => setFavoriteOnly(!favoriteOnly)}
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
          loading={categories.length === 0}
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
              onFitlerChange([null, null]);
              resetFilters();
            }}
          />
        </Form.Group>
      </>
    );
  }
);
