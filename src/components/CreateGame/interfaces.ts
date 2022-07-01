import { SearchFilters } from "../../models/rest/SearchFilters";

/** Параметры, принимаемые компонентом фильтра. */
export interface FiltersProps {
  onFitlerChange(filters: SearchFilters): void;
}
