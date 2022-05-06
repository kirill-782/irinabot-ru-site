import React, { useEffect, useState } from "react";
import { Card, Divider, Feed, Icon, Label } from "semantic-ui-react";
import { User, ChatProps } from "./interfaces";
import "./chat.scss";
import { UserChat } from "./UserChat";
import { ConsoleBot } from "./ConsoleBot";

const getUsers = (): User[] => {
  const usersStr = localStorage.getItem("chat-users");
  if (usersStr) {
    return JSON.parse(usersStr);
  }
  return [];
};

export const Chat: React.FC<ChatProps> = ({ setUnreadMessages }) => {
  const [users, setUsers] = useState(getUsers());
  const [selectedUser, setSelectedUser] = useState<User>();
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [openedChat, setOpenedChat] = useState<"chat" | "console" | "">("");

  const sendMessage = (user: User, message: string) => {
    const newUsers = [...users];
    const matchUser = newUsers.find((el) => el === user);
    matchUser.messages.push({
      message,
      date: new Date().toLocaleDateString(),
      isIncoming: false,
    });
    setSelectedUser(user);
  };

  const sendConsoleMessage = (message: string) => {
    console.log('sendConsoleMessage', message);
    const newConsoleMessages = [...consoleMessages];
    newConsoleMessages.push("Empty response");
    setConsoleMessages(newConsoleMessages);
  };

  const handleSelectUser = (user: User) => {
    const newUsers = [...users];
    const matchUser = newUsers.find((el) => el === user);
    matchUser.newMessages = false;
    console.log("u", newUsers);
    setUsers(newUsers);
    setSelectedUser(user);
    setOpenedChat("chat");
  };

  let content, label;

  switch (openedChat) {
    case "chat":
      label = selectedUser.name;
      content = <UserChat user={selectedUser} sendMessage={sendMessage} />;
      break;
    case "console":
      label = "Консоль";
      content = <ConsoleBot messages={consoleMessages} sendConsoleMessage={sendConsoleMessage} />;
      break;
    default:
      label = "Чат";
      content = (
        <Feed className="chat-feed">
        {users.map((user) => {
          const lastMessage = user.messages.length
            ? user.messages[user.messages.length - 1]
            : null;

          return (
            <React.Fragment key={user.name}>
              <Feed.Event onClick={() => handleSelectUser(user)}>
                <Feed.Label icon="user" />
                <Feed.Content>
                  <Feed.Summary>
                    {user.name}
                    <Feed.Date
                      content={
                        user.messages.length &&
                        user.messages[user.messages.length - 1].date
                      }
                    />
                  </Feed.Summary>
                  {lastMessage && (
                    <Feed.Extra>
                      {user.newMessages && (
                        <Label
                          className="chat-label-icon"
                          circular
                          color="red"
                          empty
                        />
                      )}
                      {lastMessage.isIncoming ? `${user.name}: ` : ""}
                      {lastMessage.message}
                    </Feed.Extra>
                  )}
                </Feed.Content>
              </Feed.Event>
              <Divider />
            </React.Fragment>
          );
        })}
        <Feed.Event onClick={() => setOpenedChat("console")}>
          <Feed.Label icon="pencil" />
          <Feed.Content
            date="Консоль бота"
            summary="Консоль бота для ввода команд"
          />
        </Feed.Event>
      </Feed>
      );
      break;
  }

  useEffect(() => {
    // Временная заглушка пока не появились сокеты
    if (users && !users.length) {
      const newUsers: User[] = [
        {
          name: "Лёлик",
          messages: [
            { date: "04.05.2022", message: "Привет", isIncoming: true },
          ],
          newMessages: false,
        },
        {
          name: "Болик",
          messages: [
            { date: "04.05.2023", message: "Пока", isIncoming: true },
            { date: "04.05.2027", message: "Сам пока!", isIncoming: false },
          ],
          newMessages: true,
        },
      ];
      setUsers(newUsers);
    }
    setUnreadMessages(users.some((el) => el.newMessages));
  }, [setUnreadMessages, users]);

  const closeChat = () => {
    setSelectedUser(null);
    setOpenedChat("");
  }

  return (
    <Card className="chat">
      <Card.Content>
        <Card.Header>
          {openedChat !== "" ? (
            <>
              <Icon
                name="angle left"
                onClick={closeChat}
              ></Icon>
              {label}
            </>
          ) : (
            label
          )}
        </Card.Header>
      </Card.Content>
      <Card.Content>
        { content }
      </Card.Content>
    </Card>
  );
};
