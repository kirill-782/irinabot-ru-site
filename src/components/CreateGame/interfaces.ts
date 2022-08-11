import { Map } from "../../models/rest/Map";
import { DropdownItemProps } from "semantic-ui-react";

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
