import React, { useContext } from "react";
import { memo } from "react";
import { Table } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { Slot } from "../../models/rest/Slot";
import LanguageKey from "../LanguageKey";
import "./MapSlots.scss";
import { LanguageRepositoryKeys } from "../../localization/Lang.ru";

const convertSlotTypeToString = (type: number): LanguageRepositoryKeys => {
    switch (type) {
        case 0:
            return "slotsOpen";
        case 1:
            return "slotsClose";
        case 2:
            return "slotsComputerEasy";
        case 3:
            return "slotsComputerMedium";
        case 4:
            return "slotsComputerHard";
    }

    return "unknown";
};

const convertSlotRaceToString = (type: number): LanguageRepositoryKeys => {
    if (type & 1) return "slotsHuman";
    if (type & 2) return "slotsOrc";
    if (type & 4) return "slotsUndead";
    if (type & 8) return "slotsNightElf";
    if (type & 32) return "slotsRaceHeader";

    return "unknown";
};

export const getClassColorByIndex = (colour) => {
    switch (colour) {
        case 0:
            return "red";
        case 1:
            return "blue";
        case 2:
            return "teal";
        case 3:
            return "purple";
        case 4:
            return "yellow";
        case 5:
            return "orange";
        case 6:
            return "green";
        case 7:
            return "pink";
        case 8:
            return "gray";
        case 9:
            return "light-blue";
        case 10:
            return "dark-green";
        case 11:
            return "brown";
        case 12:
            return "maroon";
        case 13:
            return "navy";
        case 14:
            return "turquoise";
        case 15:
            return "violet";
        case 16:
            return "wheat";
        case 17:
            return "peach";
        case 18:
            return "mint";
        case 19:
            return "leavender";
        case 20:
            return "coal";
        case 21:
            return "snow";
        case 22:
            return "emerald";
        case 23:
            return "peanut";
        default:
            return "";
    }
};

interface MapSlotsProps {
    slots: Slot[];
    options?: number;
}

function MapSlots({ slots, options }: MapSlotsProps) {
    const customForces = ((options || 0) & 64) === 64;

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    let teamSlots: Slot[][] = [];

    if (!customForces) teamSlots[0] = slots;
    else {
        slots.forEach((slot) => {
            if (!teamSlots[slot.team]) teamSlots[slot.team] = [];
            teamSlots[slot.team].push(slot);
        });
    }

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
                                    <Table.HeaderCell width={4}>{lang.slotsTypeHeader}</Table.HeaderCell>
                                    <Table.HeaderCell width={3}>{lang.slotsTeamHeader}</Table.HeaderCell>
                                    <Table.HeaderCell width={4}>{lang.slotsRaceHeader}</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>{lang.slotsColorHeader}</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>{lang.slotsHandicapHeader}</Table.HeaderCell>
                                </Table.Header>
                            )}
                            {slots.map((slot, index) => {
                                return (
                                    <Table.Row key={index}>
                                        <Table.Cell width={4}>{lang[convertSlotTypeToString(slot.status)]}</Table.Cell>
                                        <Table.Cell width={3}>
                                            <LanguageKey stringId="slotsTeamNumber" team={slot.team + 1}>
                                                {" "}
                                            </LanguageKey>
                                        </Table.Cell>
                                        <Table.Cell width={4}>{lang[convertSlotTypeToString(slot.race)]}</Table.Cell>
                                        <Table.Cell width={1}>
                                            <span className={`slot-color ${getClassColorByIndex(slot.colour)}`}></span>
                                        </Table.Cell>
                                        <Table.Cell width={1}>{slot.handicap}</Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table>
                    </React.Fragment>
                );
            })}
        </>
    );
}

export default memo(MapSlots);
