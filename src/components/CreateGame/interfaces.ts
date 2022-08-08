import { SearchFilters } from "../../models/rest/SearchFilters";
import { Map } from "../../models/rest/Map";
import { DropdownItemProps } from "semantic-ui-react";

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
}

export interface GameCardProps {
  map: Map;
  options: GameOptionsData;
  onClick?(): void;
  patches: DropdownItemProps[];
}

export interface GameOptionsData {
  mask: number;
  slotPreset: string;
  privateGame: boolean;
  mapSpeed: number;
  mapVisibility: number;
  mapObservers: number;
}

export interface GameOptionsProps {
  options: GameOptionsData;
  onOptionsChange: (options: GameOptionsData) => void;
}
