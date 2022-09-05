import { Container, Segment } from "semantic-ui-react";
import ReactMarkdown from "react-markdown";
import { memo } from "react";
import React from "react";

export interface MapDescriptionProps {
  desctiption: string;
}

function MapDescription({ desctiption }: MapDescriptionProps) {
  return (
    <Segment style={{ width: "100%" }}>
      <ReactMarkdown>{desctiption}</ReactMarkdown>
    </Segment>
  );
}

export default memo(MapDescription);
