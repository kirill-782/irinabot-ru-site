import { Modal, Message, List, Icon, Button } from "semantic-ui-react";
import type { SyntheticEvent } from "react";
import { useContext } from "react";
import { ConnectorGame } from "../../models/websocket/ConnectorSummary";
import { AppRuntimeSettingsContext, WebsocketContext } from "../../context";
import { ConnectorBrowserRemoveGameConverter } from "../../models/websocket/ConnectorBrowserDeleteGame";
import { ConnectorBrowserResetConverter } from "../../models/websocket/ConnectorBrowserResetGames";
import React from "react";

interface ConnectorSummaryModalProps {
  open: boolean;
  onClose: (event: SyntheticEvent, data: object) => void;
  connectorGames: ConnectorGame[];
}

const removeGameConverter = new ConnectorBrowserRemoveGameConverter();
const resetAllConverter = new ConnectorBrowserResetConverter();

function ConnectorSummaryModal({
  open,
  onClose,
  connectorGames,
}: ConnectorSummaryModalProps) {
  const websocketContext = useContext(WebsocketContext);

  const handleRemove = (gameId: number) => {
    websocketContext.connectorSocket.send(
      removeGameConverter.assembly({ gameId })
    );
  };

  const handleRemoveAll = () => {
    websocketContext.connectorSocket.send(resetAllConverter.assembly({}));
  };

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>{lang.connectorInfo}</Modal.Header>

      <Modal.Content>
        <Modal.Description>
          <Message>{lang.connectorDescription}</Message>
          {connectorGames.length > 0 ? (
            <List divided relaxed>
              {connectorGames.map((el, index) => (
                <List.Item key={index}>
                  <List.Content>
                    <List.Header as="h4">
                      {el.gameName}
                      <Button
                        icon
                        floated="right"
                        onClick={() => handleRemove(el.gameId)}
                      >
                        <Icon name="close" />
                      </Button>
                    </List.Header>
                  </List.Content>
                </List.Item>
              ))}
              <List.Item>
                <List.Content>
                  <Button
                    icon
                    floated="right"
                    negative
                    onClick={handleRemoveAll}
                  >
                    {lang.removeall}
                  </Button>
                </List.Content>
              </List.Item>
            </List>
          ) : (
            <Message>
              {websocketContext.isConnectorSocketConnected
                ? lang.notAddedAnyGamesYet
                : lang.connectorNotRunning}
            </Message>
          )}
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
}

export default ConnectorSummaryModal;
