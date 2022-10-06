import React, { useContext } from "react";
import { Modal } from "semantic-ui-react";
import { ActionData, ReplayContext } from "../Pages/ReplayParserPage";
import JSONHighlighter from "../ReplayParser/JSONHighlighter";

export interface AccessListModalProps {
  open?: boolean;
  onClose?: () => void;
  actionData: ActionData;
}

function ActionBlockDataModal({
  open,
  onClose,
  actionData,
}: AccessListModalProps) {
  const { getShortBlockDescription } = useContext(ReplayContext)!!;

  return (
    <Modal
      closeIcon
      open={open}
      onClose={() => {
        if (onClose) onClose();
      }}
    >
      <Modal.Header>{getShortBlockDescription(actionData)}</Modal.Header>
      <Modal.Content>
        <JSONHighlighter data={actionData} />
      </Modal.Content>
    </Modal>
  );
}

export default ActionBlockDataModal;
