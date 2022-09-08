import React from "react";
import { Table, Form } from "semantic-ui-react";
import { Slot } from "../../models/rest/Slot";
import { getClassColorByIndex } from "./MapSlots";

import "./MapSlots.scss";

const ALL_RACES_FLAGS = 1 | 2 | 4 | 8 | 32;
const SELECTABLE_RACE = 64;

const slotStatusOptions = [
  {
    text: "Открыто",
    value: 0,
  },
  {
    text: "Закрыто",
    value: 1,
  },
  {
    text: "Компьютер (слабый)",
    value: 2,
  },
  {
    text: "Компьютер (средний)",
    value: 3,
  },
  {
    text: "Компьютер (сильный)",
    value: 4,
  },
];

const slotRacesOptions = [
  {
    text: "Альянс",
    value: 1,
  },
  {
    text: "Орда",
    value: 2,
  },
  {
    text: "Ночные эльфы",
    value: 4,
  },
  {
    text: "Нежить",
    value: 8,
  },
  {
    text: "Случайная раса",
    value: 32,
  },
];

const slotTeamsOptions = (() => {
  let result: any[] = [];

  for (let i = 0; i < 25; ++i) {
    result[i] = {
      text: "Клан " + (i + 1),
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

  const collectSlots = () => {
    let slots: SlotExtends[] = [];

    return slots
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
            {customForces && <label>Клан {index + 1}</label>}
            <Table>
              {index === 0 && (
                <Table.Header>
                  <Table.HeaderCell width={1}>SID</Table.HeaderCell>
                  <Table.HeaderCell width={4}>Тип</Table.HeaderCell>
                  <Table.HeaderCell width={3}>Клан</Table.HeaderCell>
                  <Table.HeaderCell width={4}>Раса</Table.HeaderCell>
                  <Table.HeaderCell width={1}>Цвет</Table.HeaderCell>
                  <Table.HeaderCell width={2}>Фора</Table.HeaderCell>
                </Table.Header>
              )}
              {slots.map((slot, index) => {
                return (
                  <Table.Row key={index}>
                    <Table.Cell width={1}>{slot.sid + 1}</Table.Cell>
                    <Table.Cell width={4}>
                      <Form.Dropdown
                        options={slotStatusOptions}
                        value={slot.status}
                        onChange={(_, data) => {
                          if (onSlotsChange)
                            onSlotsChange(
                              assemblySlots({
                                ...slot,
                                status: data.value as number,
                              })
                            );
                        }}
                      ></Form.Dropdown>
                    </Table.Cell>
                    <Table.Cell width={3}>
                      <Form.Dropdown
                        options={slotTeamsOptions}
                        value={slot.team}
                        onChange={(_, data) => {
                          if (onSlotsChange)
                            onSlotsChange(
                              assemblySlots({
                                ...slot,
                                team: data.value as number,
                              })
                            );
                        }}
                      ></Form.Dropdown>
                    </Table.Cell>
                    <Table.Cell width={4}>
                      <Form.Dropdown
                        options={slotRacesOptions}
                        value={slot.race & ALL_RACES_FLAGS}
                        onChange={(_, data) => {
                          if (onSlotsChange)
                            onSlotsChange(
                              assemblySlots({
                                ...slot,
                                race:
                                  (slot.race & ~ALL_RACES_FLAGS) |
                                  (data.value as number),
                              })
                            );
                        }}
                      ></Form.Dropdown>
                      <Form.Checkbox
                        checked={!!(slot.race & SELECTABLE_RACE)}
                        label="Можно менять"
                        onChange={(_, data) => {
                          if (onSlotsChange) {
                            if (data.checked) {
                              onSlotsChange(
                                assemblySlots({
                                  ...slot,
                                  race: slot.race | SELECTABLE_RACE,
                                })
                              );
                            } else {
                              onSlotsChange(
                                assemblySlots({
                                  ...slot,
                                  race: slot.race & ~SELECTABLE_RACE,
                                })
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
                              })
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
                              })
                            );
                        }}
                      />
                    </Table.Cell>
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

export default SlotsEdit;
