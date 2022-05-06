import { Comment, Form, Button } from "semantic-ui-react";
import { useState } from "react";

interface ConsoleProps {
  sendConsoleMessage(message: string): void;
  messages: string[];
}

export const ConsoleBot: React.FC<ConsoleProps> = ({
  sendConsoleMessage,
  messages,
}) => {
  const [message, setMessage] = useState("");

  const handleClickSend = () => {
    if (!message) {
      return;
    }
    setMessage("");
    sendConsoleMessage(message);
  };

  return (
    <Comment.Group>
      {messages.map((message, index) => (
        <Comment key={index}>
          <Comment.Author as="a">Irina</Comment.Author>
          <Comment.Content>
            <Comment.Text>{message}</Comment.Text>
          </Comment.Content>
        </Comment>
      ))}

      <Form reply>
        <Form.TextArea
          rows={2}
          className="chat-textarea"
          onChange={(ev) => setMessage(ev.target.value)}
          value={message}
        />
        <Button
          content="Отправить"
          labelPosition="left"
          icon="edit"
          primary
          onClick={handleClickSend}
        />
      </Form>
    </Comment.Group>
  );
};
