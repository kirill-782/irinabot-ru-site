import { Slider } from "react-semantic-ui-range";
import { Checkbox, Dropdown, Form, Header } from "semantic-ui-react";

const settings = {
  start: [1, 24],
  min: 1,
  max: 24,
  step: 1,
};

function MapSearchFilter() {
  return (
    <div>
      <Form>
        <Header>Число игроков в карте</Header>
        <Slider multiple color="red" settings={settings} />
        <Header>Категория</Header>
        <Form.Dropdown fluid placeholder="Категория" selection />
        <Form.Checkbox label="Только проверенные карты"></Form.Checkbox>
        <Form.Checkbox label="Только карты с тегом"></Form.Checkbox>
        <Form.Checkbox label="Скрывать карты с читами"></Form.Checkbox>
      </Form>
    </div>
  );
}

export default MapSearchFilter;
