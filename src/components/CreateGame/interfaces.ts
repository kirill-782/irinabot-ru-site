export interface GameOptionsData {
    mask: number;
    slotPreset: string;
    password: string;
    mapSpeed: number;
    mapVisibility: number;
    mapObservers: number;
    configName: string;
}

export interface GameOptionsProps {
    options: GameOptionsData;
    onOptionsChange: (options: GameOptionsData) => void;
}
