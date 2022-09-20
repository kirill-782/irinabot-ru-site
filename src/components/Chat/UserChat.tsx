import { Comment, Form, Button } from "semantic-ui-react";
import { User } from "./interfaces";
import { SyntheticEvent, useState } from "react";
import React from "react";

interface UserChatProps {
  user: User;
  sendMessage(user, message): void;
}

export const UserChat: React.FC<UserChatProps> = ({ user, sendMessage }) => {
  const [message, setMessage] = useState("");

  const handleClickSend = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!message) {
      return;
    }
    setMessage("");
    sendMessage(user, message);
  };

  return (
    <Comment.Group>
      {user.messages.map((message, index) => (
        <Comment key={index}>
          <Comment.Content>
            <Comment.Author as="a">
              {message.isIncoming ? user.name : "Вы"}
            </Comment.Author>
            <Comment.Metadata>
              <div>{message.date}</div>
            </Comment.Metadata>
            <Comment.Text>{message.message}</Comment.Text>
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
