export interface CreateGameRequest {
    name: string; // min: 3, max: 50
    configName: string; // max: 50
    saveGameData?: SaveGameData;
    mapGameSettings: MapGameSettings;
    password?: string;
    targetBotId: number;
    mapId: number;
    configId?: number;
    version?: string;
}

interface MapGameSettings {
    flags: number;
    teamPreset: string;
    hcl: string;
}

interface SaveGameData {
    mapPath: string; // min: 1, max: 53
    magicNumber: number;
    randomSeed: number;
    slots: SlotInfo[]; // min length: 1
    saveGameFileName: string; // min: 1, max: 53
}

interface SlotInfo {
    playerId: number; // 0–255
    downloadStatus: number; // 0–255
    slotStatus: number; // 0–255
    computer: number; // 0–255
    team: number; // 0–255
    color: number; // 0–255
    race: number; // 0–255
    computerType: number; // 0–255
    handicap: number; // 0–255
}