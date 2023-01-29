import { Comment, Form, Button } from "semantic-ui-react";
import { User } from "./interfaces";
import { SyntheticEvent, useContext, useState } from "react";
import {AppRuntimeSettingsContext} from "./../../context";
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

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  
  return (
    <Comment.Group>
      {user.messages.map((message, index) => (
        <Comment key={index}>
          <Comment.Content>
            <Comment.Author as="a">
              {message.isIncoming ? user.name : t("chat.you")}
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
          content={t("chat.send")}
          labelPosition="left"
          icon="edit"
          primary
          onClick={handleClickSend}
        />
      </Form>
    </Comment.Group>
  );
};
