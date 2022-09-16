import React, { useContext } from "react";
import { AuthContext } from "../context";
import { Form, StrictFormFieldProps } from "semantic-ui-react";

interface SpaceIdProps {
  requiredAccessMask: number;
  value?: number;
  onChange?: (value: number) => void;
  [key: string]: any;
}

function SpaceId({
  requiredAccessMask,
  value,
  onChange,
  ...props
}: SpaceIdProps & StrictFormFieldProps) {
  const { accessMask, currentAuth } = useContext(AuthContext).auth;

  const hasGlobalAccess = accessMask.getRecords().some((i) => {
    return (
      i.spaceId === 0 &&
      (i.accessMask & requiredAccessMask) === requiredAccessMask
    );
  });

  if (hasGlobalAccess) {
    return (
      <Form.Input
        type="number"
        {...props}
        value={value}
        onChange={(_, data) => {
          if (onChange) onChange(parseInt(data.value));
        }}
      ></Form.Input>
    );
  }

  const options = accessMask
    .getRecords()
    .filter((i) => {
      return (i.accessMask & requiredAccessMask) === requiredAccessMask;
    })
    .map((i) => {
      return {
        value: i.spaceId,
        text: i.spaceId,
      };
    });

  return (
    <Form.Select
      options={options}
      value={value}
      {...props}
      onChange={(_, data) => {
        if (onChange)
          onChange(
            parseInt(
              data.value?.toString() || currentAuth.connectorId.toString()
            )
          );
      }}
    ></Form.Select>
  );
}

export default SpaceId;
