import React from "react";
import { Button, Icon } from "semantic-ui-react";

import byteSize from "byte-size";

interface MapDownloadButtonProps {
  downloadUrl: string;
  fileName?: string;
  fileSize?: number;
  className?: string;
}

function MapDownloadButton({
  downloadUrl,
  fileName,
  fileSize,
  className,
}: MapDownloadButtonProps) {
  const mapSize = byteSize(fileSize);

  return (
    <Button
      className={className}
      floated="left"
      color="green"
      as="a"
      href={`${downloadUrl}?as=${fileName}`}
    >
      <Icon name="download" />
      {`Скачать ${mapSize.value} ${mapSize.unit}`}
    </Button>
  );
}

export default MapDownloadButton;
