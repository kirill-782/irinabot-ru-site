import { SearchFilters } from "../../models/rest/SearchFilters";
import { Map } from "../../models/rest/Map";
import { DropdownItemProps } from "semantic-ui-react";

/** Параметры, принимаемые компонентом фильтра. */
export interface FiltersProps {
  onFitlerChange(filters: SearchFilters): void;
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
