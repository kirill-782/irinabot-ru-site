import React, { memo, useContext, useMemo, useState } from "react";
import { Card } from "semantic-ui-react";
import ActionBlockDataModal from "../Modal/ActionBlockDataModal";
import { ActionData, ReplayContext } from "../Pages/ReplayParserPage";

interface ShortBlockCardListProps {
  actionsBlocks: ActionData[];
}

function ShortBlockCardList({ actionsBlocks }: ShortBlockCardListProps) {
  const { getShortBlockDescription } = useContext(ReplayContext)!!;

  const [modalActionBlock, setModalActionBlock] = useState<ActionData>();

  const list = useMemo(() => {
    return actionsBlocks.map((i) => {
      return (
        <Card
          fluid
          onClick={(e) => {
            setModalActionBlock(i);
          }}
          key={i.seqenceNumber}
        >
          <Card.Content>{getShortBlockDescription(i)}</Card.Content>
        </Card>
      );
    });
  }, [actionsBlocks]);

  return (
    <>
      {list}
      {modalActionBlock && (
        <ActionBlockDataModal
          actionData={modalActionBlock}
          open={!!modalActionBlock}
          onClose={() => {
            setModalActionBlock(undefined);
          }}
        ></ActionBlockDataModal>
      )}
    </>
  );
}

export default memo(ShortBlockCardList);
