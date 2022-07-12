import { SearchFilters } from "../../models/rest/SearchFilters";
import { Map } from "../../models/rest/Map";
import { DropdownItemProps } from "semantic-ui-react";

/** Параметры, принимаемые компонентом фильтра. */
export interface FiltersProps {
  onFitlerChange(filters: SearchFilters): void;
}

export interface GameCardProps {
  map: Map;
  mapFlagTeamsTogether: number;
  mapFlagFixedTeams: number;
  mapFlagUnitShare: number;
  mapFlagRandomHero: number;
  mapFlagRandomRaces: number;
  mapSpeed: number;
  mapVisibility: number;
  mapObservers: number;
  privateGame: number;
  onClick?(): void;
  patches: DropdownItemProps[];
}
