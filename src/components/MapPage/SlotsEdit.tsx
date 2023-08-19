import React, { useContext } from "react";
import { Table, Form } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { Slot } from "../../models/rest/Slot";
import { getClassColorByIndex } from "./MapSlots";

import "./MapSlots.scss";
import { LanguageRepositoryKeys } from "../../localization/Lang.ru";
import LanguageKey from "../LanguageKey";

const ALL_RACES_FLAGS = 1 | 2 | 4 | 8 | 32;
const SELECTABLE_RACE = 64;

interface OptionWithLanguageKey {
    langKey: LanguageRepositoryKeys;
    value: number;
    teamNumber?: number;
}

const slotStatusOptions = [
    {
        langKey: "slotsOpen",
        value: 0,
    },
    {
        langKey: "slotsClose",
        value: 1,
    },
    {
        langKey: "slotsComputerEasy",
        value: 2,
    },
    {
        langKey: "slotsComputerMedium",
        value: 3,
    },
    {
        langKey: "slotsComputerHard",
        value: 4,
    },
] as OptionWithLanguageKey[];

const slotRacesOptions = [
    {
        langKey: "slotsHuman",
        value: 1,
    },
    {
        langKey: "slotsOrc",
        value: 2,
    },
    {
        langKey: "slotsNightElf",
        value: 4,
    },
    {
        langKey: "slotsUndead",
        value: 8,
    },
    {
        langKey: "slotsRandom",
        value: 32,
    },
] as OptionWithLanguageKey[];

const slotTeamsOptions = (() => {
    let result: OptionWithLanguageKey[] = [];

    for (let i = 0; i < 25; ++i) {
        result[i] = {
            teamNumber: i + 1,
            langKey: "slotsTeamNumber",
            value: i,
        };
    }

    return result;
})();

const slotColorsOptions = (() => {
    let result: any[] = [];

    for (let i = 0; i < 25; ++i) {
        result[i] = {
            value: i,
            text: <span className={`slot-color ${getClassColorByIndex(i)}`}></span>,
        };
    }

    return result;
})();

interface SlotsEditProps {
    slots?: Slot[];
    options?: number;
    onSlotsChange?: (slots: Slot[]) => void;
}

interface SlotExtends extends Slot {
    sid: number;
}

function SlotsEdit({ slots, options, onSlotsChange }: SlotsEditProps) {
    const customForces = ((options || 0) & 64) === 64;

    let teamSlots: SlotExtends[][] = [];

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const t = language.getString;

    if (slots) {
        if (!customForces)
            teamSlots[0] = slots.map((slot, index) => {
                return {
                    ...slot,
                    sid: index,
                };
            });
        else {
            slots.forEach((slot, index) => {
                if (!teamSlots[slot.team]) teamSlots[slot.team] = [];
                teamSlots[slot.team].push({ ...slot, sid: index });
            });
        }
    }

    const collectSlots = (): SlotExtends[] => {
        return []
            .concat(...teamSlots)
            .filter((i) => !!i)
            .sort((a, b) => a.sid - b.sid);
    };

    const assemblySlots = (updateSlot: SlotExtends): Slot[] => {
        return collectSlots().map((i) => {
            if (i.sid === updateSlot.sid)
                return {
                    status: updateSlot.status,
                    team: updateSlot.team,
                    colour: updateSlot.colour,
                    race: updateSlot.race,
                    handicap: updateSlot.handicap,
                };

            return {
                status: i.status,
                team: i.team,
                colour: i.colour,
                race: i.race,
                handicap: i.handicap,
            };
        });
    };

    return (
        <>
            {teamSlots.map((slots, index) => {
                return (
                    <React.Fragment key={index}>
                        {customForces && (
                            <label>
                                <LanguageKey stringId={"slotsTeamNumber"} team={index + 1} />
                            </label>
                        )}
                        <Table>
                            {index === 0 && (
                                <Table.Header>
                                    <Table.HeaderCell width={1}>SID</Table.HeaderCell>
                                    <Table.HeaderCell width={4}>{lang.slotsTypeHeader}</Table.HeaderCell>
                                    <Table.HeaderCell width={3}>{lang.slotsTeamHeader}</Table.HeaderCell>
                                    <Table.HeaderCell width={4}>{lang.slotsRaceHeader}</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>{lang.slotsColorHeader}</Table.HeaderCell>
                                    <Table.HeaderCell width={2}>{lang.slotsHandicapHeader}</Table.HeaderCell>
                                </Table.Header>
                            )}
                            <Table.Body>
                                {slots.map((slot, index) => {
                                    return (
                                        <Table.Row key={index}>
                                            <Table.Cell width={1}>{slot.sid + 1}</Table.Cell>
                                            <Table.Cell width={4}>
                                                <Form.Dropdown
                                                    options={slotStatusOptions.map((i) => {
                                                        return { ...i, text: t(i.langKey) };
                                                    })}
                                                    value={slot.status}
                                                    onChange={(_, data) => {
                                                        if (onSlotsChange)
                                                            onSlotsChange(
                                                                assemblySlots({
                                                                    ...slot,
                                                                    status: data.value as number,
                                                                }),
                                                            );
                                                    }}
                                                ></Form.Dropdown>
                                            </Table.Cell>
                                            <Table.Cell width={3}>
                                                <Form.Dropdown
                                                    options={slotTeamsOptions.map((i) => {
                                                        return { ...i, text: t(i.langKey, { team: i.teamNumber }) };
                                                    })}
                                                    value={slot.team}
                                                    onChange={(_, data) => {
                                                        if (onSlotsChange)
                                                            onSlotsChange(
                                                                assemblySlots({
                                                                    ...slot,
                                                                    team: data.value as number,
                                                                }),
                                                            );
                                                    }}
                                                ></Form.Dropdown>
                                            </Table.Cell>
                                            <Table.Cell width={4}>
                                                <Form.Dropdown
                                                    options={slotRacesOptions.map((i) => {
                                                        return { ...i, text: t(i.langKey) };
                                                    })}
                                                    value={slot.race & ALL_RACES_FLAGS}
                                                    onChange={(_, data) => {
                                                        if (onSlotsChange)
                                                            onSlotsChange(
                                                                assemblySlots({
                                                                    ...slot,
                                                                    race:
                                                                        (slot.race & ~ALL_RACES_FLAGS) |
                                                                        (data.value as number),
                                                                }),
                                                            );
                                                    }}
                                                ></Form.Dropdown>
                                                <Form.Checkbox
                                                    checked={!!(slot.race & SELECTABLE_RACE)}
                                                    label={lang.slotsCanChange}
                                                    onChange={(_, data) => {
                                                        if (onSlotsChange) {
                                                            if (data.checked) {
                                                                onSlotsChange(
                                                                    assemblySlots({
                                                                        ...slot,
                                                                        race: slot.race | SELECTABLE_RACE,
                                                                    }),
                                                                );
                                                            } else {
                                                                onSlotsChange(
                                                                    assemblySlots({
                                                                        ...slot,
                                                                        race: slot.race & ~SELECTABLE_RACE,
                                                                    }),
                                                                );
                                                            }
                                                        }
                                                    }}
                                                ></Form.Checkbox>
                                            </Table.Cell>
                                            <Table.Cell width={1}>
                                                <Form.Dropdown
                                                    options={slotColorsOptions}
                                                    value={slot.colour}
                                                    scrolling
                                                    onChange={(_, data) => {
                                                        if (onSlotsChange)
                                                            onSlotsChange(
                                                                assemblySlots({
                                                                    ...slot,
                                                                    colour: data.value as number,
                                                                }),
                                                            );
                                                    }}
                                                ></Form.Dropdown>
                                            </Table.Cell>
                                            <Table.Cell width={2}>
                                                <Form.Input
                                                    fluid
                                                    type="number"
                                                    value={slot.handicap}
                                                    onChange={(_, data) => {
                                                        if (onSlotsChange)
                                                            onSlotsChange(
                                                                assemblySlots({
                                                                    ...slot,
                                                                    handicap: parseInt(data.value),
                                                                }),
                                                            );
                                                    }}
                                                />
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table>
                    </React.Fragment>
                );
            })}
        </>
    );
}

export default SlotsEdit;
