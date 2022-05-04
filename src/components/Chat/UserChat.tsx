import { Comment, Form, Button } from "semantic-ui-react";
import { User } from "./interfaces";

interface UserChatProps {
  user: User;
}

export const UserChat: React.FC<UserChatProps> = ({ user }) => {
  console.log("user", user);

  return (
    <Comment.Group>
      {user.messages.map((message, index) => (
        <Comment key={index}>
          <Comment.Content>
            <Comment.Author as="a">{message.isIncoming ? user.name : "Вы"}</Comment.Author>
            <Comment.Metadata>
              <div>{message.date}</div>
            </Comment.Metadata>
            <Comment.Text>{message.message}</Comment.Text>
          </Comment.Content>
        </Comment>
      ))}

      <Form reply>
        <Form.TextArea rows={2} className="chat-textarea" />
        <Button content="Add Reply" labelPosition="left" icon="edit" primary />
      </Form>
    </Comment.Group>
  );
};
