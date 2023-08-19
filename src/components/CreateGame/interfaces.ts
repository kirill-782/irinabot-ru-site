export interface GameOptionsData {
    mask: number;
    slotPreset: string;
    privateGame: boolean;
    mapSpeed: number;
    mapVisibility: number;
    mapObservers: number;
    configName: string;
}

export interface GameOptionsProps {
    options: GameOptionsData;
    onOptionsChange: (options: GameOptionsData) => void;
}
