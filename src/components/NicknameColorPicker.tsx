import React, { memo, useContext, useState } from "react";
import { Form, Label, Segment } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../context";

import { HuePicker } from "react-color";
import WarcraftIIIText from "./WarcraftIIIText";

const componentToHex = (c) => {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

const rgbToColorTag = (r, g, b) => {
  return "|cFF" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

interface NicknameColorPickerProps {
  nickname: string;
  onColorChanged: (color: number) => void;
  defaultColor?: {
    r: number;
    g: number;
    b: number;
  };
}

function NicknameColorPicker({
  nickname,
  onColorChanged,
  defaultColor,
}: NicknameColorPickerProps) {
  const [color, setColor] = useState<any>(defaultColor);

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  return (
    <>
      <Form.Field>
        <label>{lang.nicknameColorPickerSelectColor}</label>

        <HuePicker
          color={color}
          onChange={(color) => {
            console.log(color);
            setColor(color.rgb);
          }}
        ></HuePicker>
      </Form.Field>
      <Form.Field>
        <label>{lang.nicknameColorPickerPreview}</label>
        <Segment>
          <WarcraftIIIText>
            {(color ? rgbToColorTag(color.r, color.g, color.b) : "") + nickname}
          </WarcraftIIIText>
        </Segment>
      </Form.Field>

      <Form.Button
        color="green"
        onClick={() => {
          onColorChanged((color.r << 16) | (color.g << 8) | color.b);
        }}
      >
        {lang.nicknameColorPickerSaveColor}
      </Form.Button>
    </>
  );
}

export default memo(NicknameColorPicker);
