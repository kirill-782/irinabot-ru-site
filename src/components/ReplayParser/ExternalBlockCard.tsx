import React, { useContext, useState } from "react";
import { Card, Label, Message } from "semantic-ui-react";
import { ActionData, ReplayContext } from "../Pages/ReplayParserPage";
import prettyMilliseconds from "pretty-ms";
import ActionBlockDataModal from "../Modal/ActionBlockDataModal";
import { AppRuntimeSettingsContext } from "../../context";
import LanguageKey from "../LanguageKey";

interface ExternalBlockCardProps {
  actionsBlock: ActionData;
}

function ExternalBlockCard({ actionsBlock }: ExternalBlockCardProps) {
  const { getShortBlockDescription, replayData } = useContext(ReplayContext)!!;
  const [isModalOpen, setModalOpen] = useState(false);

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

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
            <LanguageKey stringId="externalBlockCard" timems={prettyMilliseconds(actionsBlock.time)} />
          </Card.Meta>
          <Card.Description>
            {actionsBlock.errorMessage && (
              <Message error>{actionsBlock.errorMessage}</Message>
            )}

            {actionsBlock.commandBlocks.length === 0 ? (
              lang.externalBlockCardEmptyBlock
            ) : (
              <>
                {actionsBlock.commandBlocks.map((i, k) => {
                  return (
                    <React.Fragment key={k}>
                      <Label>
                        <LanguageKey stringId={"externalBlockCardPlayerSummaryLabel"} count={i.actions.length} name={getPlayerName(i.playerId)}/>
                      </Label>
                      {i.remaingBuffer.length > 0 && (
                        <Label color="orange">
                          {lang.externalBlockCardUnknownActionsLabel}
                        </Label>
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
