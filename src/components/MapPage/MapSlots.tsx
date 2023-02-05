import React, { useContext } from "react";
import { memo } from "react";
import { Table } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { Slot } from "../../models/rest/Slot";
import "./MapSlots.scss";

const convertSlotTypeToString = (type: number) => {
  switch (type) {
    case 0:
      return "page.map.slots.type.open";
    case 1:
      return "page.map.slots.type.closed";
    case 2:
      return "page.map.slots.type.aiEasy";
    case 3:
      return "page.map.slots.type.aiMedium";
    case 4:
      return "page.map.slots.type.aiInsane";
  }

  return type;
};

const convertSlotRaceToString = (type: number) => {
  if (type & 1) return "page.map.slots.race.human";
  if (type & 2) return "page.map.slots.race.orc";
  if (type & 4) return "page.map.slots.race.nightelf";
  if (type & 8) return "page.map.slots.race.undead";
  if (type & 32) return "page.map.slots.race.random";

  return type.toString();
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
  const t = language.getString;

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
                {t("page.map.slots.force")} {index + 1}
              </label>
            )}
            <Table>
              {index === 0 && (
                <Table.Header>
                  <Table.HeaderCell width={4}>
                    {t("page.map.slots.slot.type")}
                  </Table.HeaderCell>
                  <Table.HeaderCell width={3}>
                    {t("page.map.slots.slot.team")}
                  </Table.HeaderCell>
                  <Table.HeaderCell width={4}>
                    {t("page.map.slots.slot.race")}
                  </Table.HeaderCell>
                  <Table.HeaderCell width={1}>
                    {t("page.map.slots.slot.teamcolor")}
                  </Table.HeaderCell>
                  <Table.HeaderCell width={1}>
                    {t("page.map.slots.slot.handicap")}
                  </Table.HeaderCell>
                </Table.Header>
              )}
              {slots.map((slot, index) => {
                return (
                  <Table.Row key={index}>
                    <Table.Cell width={4}>
                      {t(convertSlotTypeToString(slot.status) as string)}
                    </Table.Cell>
                    <Table.Cell width={3}>
                      {t("page.map.slots.slot.team")} {slot.team + 1}
                    </Table.Cell>
                    <Table.Cell width={4}>
                      {t(convertSlotRaceToString(slot.race))}
                    </Table.Cell>
                    <Table.Cell width={1}>
                      <span
                        className={`slot-color ${getClassColorByIndex(
                          slot.colour
                        )}`}
                      ></span>
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
