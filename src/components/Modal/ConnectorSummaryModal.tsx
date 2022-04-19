import { Modal, Header, Message, List, Icon, Button, Placeholder } from "semantic-ui-react";
import type { SyntheticEvent } from "react";
import { useContext } from "react";
import { ConnectorGame } from "../../models/websocket/ConnectorSummary";
import { WebsocketContext } from "../../context";
import { ConnectorBrowserRemoveGameConverter } from "../../models/websocket/ConnectorBrowserDeleteGame";
import { ConnectorBrowserResetConverter } from "../../models/websocket/ConnectorBrowserResetGames";

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
    websocketContext.ghostSocket.send(removeGameConverter.assembly({ gameId }));
  };

  const handleRemoveAll = () => {
    websocketContext.ghostSocket.send(resetAllConverter.assembly({}));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>Сводка коннектора</Modal.Header>

      <Modal.Content>
        <Modal.Description>
          <Message>
            Эти игры будут отправлены в локальную сеть Warcraft III. Вы можете
            убрать игру из списка, или очтистить его
          </Message>
          {connectorGames ? (
            <List divided relaxed>
              {connectorGames.map((el) => (
                <List.Item>
                  <List.Content>
                    <List.Header as="h4">
                      {el.mapName}
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
                    Убрать все
                  </Button>
                </List.Content>
              </List.Item>
            </List>
          ) : (
            <Placeholder>
              <Placeholder.Paragraph>
                <Placeholder.Line />
                <Placeholder.Line />
                <Placeholder.Line />
              </Placeholder.Paragraph>
            </Placeholder>
          )}
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
}

export default ConnectorSummaryModal;
