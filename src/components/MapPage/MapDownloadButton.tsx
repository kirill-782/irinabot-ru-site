import React from "react";
import { Button, Icon } from "semantic-ui-react";

import byteSize from "byte-size";
import { getBotFileName } from "../../utils/MapFileUtils";

interface MapDownloadButtonProps {
  downloadUrl: string;
  fileName?: string;
  fileSize?: number;
  className?: string;
  id: number;
}

function MapDownloadButton({
  downloadUrl,
  fileName,
  fileSize,
  className,
  id,
}: MapDownloadButtonProps) {
  const mapSize = byteSize(fileSize);

  return (
    <Button
      className={className}
      floated="left"
      color="green"
      as="a"
      href={`${downloadUrl}?as=${getBotFileName(fileName || "", id)}`}
    >
      <Icon name="download" />
      {`Скачать ${mapSize.value} ${mapSize.unit}`}
    </Button>
  );
}

export default MapDownloadButton;
