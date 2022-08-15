import { Table } from "semantic-ui-react";
import { Slot } from "../../models/rest/Slot";
import "./MapSlots.scss";

const convertSlotTypeToString = (type: number) => {
  switch (type) {
    case 0:
      return "Открыто";
    case 1:
      return "Закрыто";
    case 2:
      return "Компьютер (слабый)";
    case 3:
      return "Компьютер (срадний)";
    case 4:
      return "Компьютер (сильный)";
  }

  return type;
};

const convertSlotRaceToString = (type: number) => {
  if (type & 1) return "Альянс";
  if (type & 2) return "Орда";
  if (type & 4) return "Ночные эльфы";
  if (type & 8) return "Нежить";
  if (type & 32) return "Случайная раса";

  return type.toString();
};

const getClassColorByIndex = (colour) => {
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
      <Table>
        <Table.Header>
          <Table.HeaderCell width={4}>Тип</Table.HeaderCell>
          <Table.HeaderCell width={3}>Клан</Table.HeaderCell>
          <Table.HeaderCell width={4}>Раса</Table.HeaderCell>
          <Table.HeaderCell width={2}>Цвет</Table.HeaderCell>
          <Table.HeaderCell width={2}>Фора</Table.HeaderCell>
        </Table.Header>
      </Table>
      {teamSlots.map((slots, index) => {
        return (
          <>
            {customForces && <label>Клан {index + 1}</label>}
            <Table>
              {slots.map((slot, index) => {
                return (
                  <Table.Row key={index}>
                    <Table.Cell width={4}>
                      {convertSlotTypeToString(slot.status)}
                    </Table.Cell>
                    <Table.Cell width={3}>Клан {slot.team + 1}</Table.Cell>
                    <Table.Cell width={4}>
                      {convertSlotRaceToString(slot.race)}
                    </Table.Cell>
                    <Table.Cell width={2}>
                      <span
                        className={`slot-color ${getClassColorByIndex(
                          slot.colour
                        )}`}
                      ></span>
                    </Table.Cell>
                    <Table.Cell width={2}>{slot.handicap}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table>
          </>
        );
      })}
    </>
  );
}

export default MapSlots;
