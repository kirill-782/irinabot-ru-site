import { SlotInfo } from "@kokomi/w3g-parser-browser";
import { DataBuffer } from "../../utils/DataBuffer";
import { AbstractConverter, AbstractPackage } from "./AbstractPackage";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_CREATE_GAME } from "./HeaderConstants";

export interface ClientCreateGame extends AbstractPackage {
    privateGame: boolean;
    flags: number;
    slotPreset: string;
    gameName: string;
    mapData: string;
    configName: string;
    saveGame?: SaveGameData;
}

export interface SaveGameData {
    mapPath: string;
    magicNumber: number;
    randomSeed: number;
    slots: SlotInfo[];
    saveGameFileName: string;
}

export class ClientCreateGameConverter extends AbstractConverter {
    public assembly(data: ClientCreateGame) {
        const dataBuffer = new DataBuffer(new ArrayBuffer(2));

        dataBuffer.putUint8(DEFAULT_CONTEXT_HEADER_CONSTANT);
        dataBuffer.putUint8(DEFAULT_CREATE_GAME);
        dataBuffer.putInt8(data.privateGame ? 1 : 0);
        dataBuffer.putUint16(data.flags);

        dataBuffer.putNullTerminatedString(data.slotPreset);
        dataBuffer.putNullTerminatedString(data.gameName);
        dataBuffer.putNullTerminatedString(data.mapData);
        dataBuffer.putNullTerminatedString(data.configName);

        dataBuffer.putUint8(data.saveGame ? 1 : 0);

        if (data.saveGame) {
            dataBuffer.putNullTerminatedString(data.saveGame.mapPath);
            dataBuffer.putUint32(data.saveGame.magicNumber);
            dataBuffer.putUint32(data.saveGame.randomSeed);

            dataBuffer.putUint8(data.saveGame.slots.length);

            for (let i = 0; i < data.saveGame.slots.length; ++i) {
                dataBuffer.putUint8(data.saveGame.slots[i].playerId);
                dataBuffer.putUint8(data.saveGame.slots[i].downloadStatus);
                dataBuffer.putUint8(data.saveGame.slots[i].slotStatus);
                dataBuffer.putUint8(data.saveGame.slots[i].computer);
                dataBuffer.putUint8(data.saveGame.slots[i].team);
                dataBuffer.putUint8(data.saveGame.slots[i].color);
                dataBuffer.putUint8(data.saveGame.slots[i].race);
                dataBuffer.putUint8(data.saveGame.slots[i].computerType);
                dataBuffer.putUint8(data.saveGame.slots[i].handicap);
            }

            dataBuffer.putNullTerminatedString(data.saveGame.saveGameFileName);
        }

        return dataBuffer.toArrayBuffer();
    }

    public parse(dataBuffer: DataBuffer): ClientCreateGame {
        return {
            context: DEFAULT_CONTEXT_HEADER_CONSTANT,
            type: DEFAULT_CREATE_GAME,
            privateGame: dataBuffer.getUint8() > 0,
            flags: dataBuffer.getUint16(),
            slotPreset: dataBuffer.getNullTerminatedString(),
            gameName: dataBuffer.getNullTerminatedString(),
            mapData: dataBuffer.getNullTerminatedString(),
            configName: dataBuffer.getNullTerminatedString(),
            saveGame: (() => {
                if (dataBuffer.getUint8()) {
                    const mapPath = dataBuffer.getNullTerminatedString();
                    const magicNumber = dataBuffer.getUint32();
                    const randomSeed = dataBuffer.getUint32();

                    const slotsCount = dataBuffer.getUint8();

                    const slots = new Array<SlotInfo>();

                    for (let i = 0; i < slotsCount; ++i) {
                        slots.push({
                            playerId: dataBuffer.getUint8(),
                            downloadStatus: dataBuffer.getUint8(),
                            slotStatus: dataBuffer.getUint8(),
                            computer: dataBuffer.getUint8(),
                            team: dataBuffer.getUint8(),
                            color: dataBuffer.getUint8(),
                            race: dataBuffer.getUint8(),
                            computerType: dataBuffer.getUint8(),
                            handicap: dataBuffer.getUint8(),
                        });
                    }

                    return {
                        mapPath,
                        magicNumber,
                        randomSeed,
                        slots,
                        saveGameFileName: dataBuffer.getNullTerminatedString(),
                    };
                }

                return undefined;
            })(),
        };
    }
}
