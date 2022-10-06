import React, { useContext, useState } from "react";
import { Card, Label, Message } from "semantic-ui-react";
import { ActionData, ReplayContext } from "../Pages/ReplayParserPage";
import prettyMilliseconds from "pretty-ms";
import ActionBlockDataModal from "../Modal/ActionBlockDataModal";

interface ExternalBlockCardProps {
  actionsBlock: ActionData;
}

function ExternalBlockCard({ actionsBlock }: ExternalBlockCardProps) {
  const { getShortBlockDescription, replayData } = useContext(ReplayContext)!!;
  const [isModalOpen, setModalOpen] = useState(false);

  const getPlayerName = (pid: number) => {
    if (replayData.records.gameInfo?.hostPlayer.playerId === pid)
      return replayData.records.gameInfo?.hostPlayer.playerName;

    return replayData?.records.players.find((i) => {
      return i.playerId === pid;
    })?.playerName;
  };

  return (
    <>
      <Card
        fluid
        onClick={() => {
          setModalOpen(true);
        }}
      >
        <Card.Content>
          <Card.Header>{getShortBlockDescription(actionsBlock)}</Card.Header>
          <Card.Meta>
            {prettyMilliseconds(actionsBlock.time)} после старта игры
          </Card.Meta>
          <Card.Description>
            {actionsBlock.errorMessage && (
              <Message error>{actionsBlock.errorMessage}</Message>
            )}

            {actionsBlock.commandBlocks.length === 0 ? (
              "(пустой блок)"
            ) : (
              <>
                {actionsBlock.commandBlocks.map((i, k) => {
                  return (
                    <React.Fragment key={k}>
                      <Label>
                        {i.actions.length} комманд от{" "}
                        {getPlayerName(i.playerId)}
                      </Label>
                      {i.remaingBuffer.length > 0 && (
                        <Label color="orange">Неизвестные действия</Label>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </Card.Description>
        </Card.Content>
      </Card>
      <ActionBlockDataModal
        actionData={actionsBlock}
        open={isModalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
      ></ActionBlockDataModal>
    </>
  );
}

export default ExternalBlockCard;
