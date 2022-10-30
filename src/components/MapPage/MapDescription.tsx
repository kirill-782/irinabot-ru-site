import { Segment } from "semantic-ui-react";
import { memo } from "react";
import React from "react";
import Markdown from "../Markdown";

export interface MapDescriptionProps {
  desctiption: string;
}

function MapDescription({ desctiption }: MapDescriptionProps) {
  return (
    <Segment style={{ width: "100%" }}>
      <Markdown>{desctiption}</Markdown>
    </Segment>
  );
}

export default memo(MapDescription);
