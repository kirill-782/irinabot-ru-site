import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { Card, Divider, Feed, Icon, Label } from "semantic-ui-react";
import { User, ChatProps, Message } from "./interfaces";
import "./chat.scss";
import { UserChat } from "./UserChat";
import { ConsoleBot } from "./ConsoleBot";
import { AuthContext, WebsocketContext } from "./../../context";
import { ClientTextMessageConverter } from "./../../models/websocket/ClientTextMessage";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_NEW_MESSAGE,
} from "../../models/websocket/HeaderConstants";
import {
  ServerTextMessage,
  ServerTextMessageConverter,
} from "../../models/websocket/ServerTextMessage";

const getUsers = (): User[] => {
  const usersStr = localStorage.getItem("chat-users");
  if (usersStr) {
    return JSON.parse(usersStr);
  }
  return [];
};

const saveUsers = (users: User[]) => {
  // Сохраняем последние 10 сообщений
  let stringifyUsers = JSON.stringify(users.map((el) => ({ ...el, messages: el.messages.slice(-10) })));
  // TODO найти точный параметр для подкрутки
  // Если слишком много сообщений, подчистить все сообщения
  if (stringifyUsers.length > 20000) {
    stringifyUsers = JSON.stringify(
      users.map((el) => ({ ...el, messages: [] }))
    );
  }
  localStorage.setItem("chat-users", stringifyUsers);
};

export const Chat: React.FC<ChatProps> = ({ setUnreadMessages }) => {
  const authContext = useContext(AuthContext);
  const sockets = useContext(WebsocketContext);
  const [users, setUsers] = useState(getUsers());
  const [selectedUser, setSelectedUser] = useState<User>();
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [openedChat, setOpenedChat] = useState<"chat" | "console" | "">("");
  const [confirmRemove, setConfirmRemove] = useState<User>();

  useEffect(() => {
    if (confirmRemove) {
      setTimeout(() => {
        setConfirmRemove(undefined);
      }, 2000);
    }
  }, [confirmRemove]);

  const sendMessage = (user: User, message: string) => {
    const newUsers = [...users];
    const matchUser = newUsers.find((el) => el === user);
    matchUser.messages.push({
      message,
      date: new Date().toLocaleDateString(),
      isIncoming: false,
    });
    const converter = new ServerTextMessageConverter();
    // const converter = new ClientTextMessageConverter();
    const me = authContext?.auth?.currentAuth?.nickname;
    sockets.ghostSocket.send(
      converter.assembly({ from: me, to: user.name, text: message })
    );
    setSelectedUser(user);
  };

  const sendConsoleMessage = (message: string) => {
    const converter = new ClientTextMessageConverter();
    sockets.ghostSocket.send(
      converter.assembly({ from: "chat", to: "", text: message })
    );
  };

  const handleSelectUser = (user: User) => {
    const newUsers = [...users];
    const matchUser = newUsers.find((el) => el === user);
    matchUser.newMessages = false;
    saveUsers(newUsers);
    setUsers(newUsers);
    setSelectedUser(user);
    setOpenedChat("chat");
  };

  const handleRemoveUser = (ev: SyntheticEvent, user: User) => {
    ev.preventDefault();
    ev.stopPropagation();
    setConfirmRemove(user);
  }

  const removeUser = (ev: SyntheticEvent, user: User) => {
    ev.preventDefault();
    ev.stopPropagation();
    const newUsers = users.filter((el) => el !== user);
    saveUsers(newUsers);
    setUsers(newUsers);
  };

  let content, label;

  switch (openedChat) {
    case "chat":
      label = selectedUser.name;
      content = <UserChat user={selectedUser} sendMessage={sendMessage} />;
      break;
    case "console":
      label = "Консоль";
      content = (
        <ConsoleBot
          messages={consoleMessages}
          sendConsoleMessage={sendConsoleMessage}
        />
      );
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
                      {confirmRemove === user ? (
                        <span className="remove-user-button" onClick={(ev) => removeUser(ev, user)}>
                          Подтвердить удаление
                        </span>
                      ) : (
                        <Icon name="remove" onClick={(ev) => handleRemoveUser(ev, user)} />
                      )}
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
    const onPacket = (packet: GHostPackageEvent) => {
      if (
        packet.detail.package.context === DEFAULT_CONTEXT_HEADER_CONSTANT &&
        packet.detail.package.type === DEFAULT_NEW_MESSAGE
      ) {
        const message = packet.detail.package as ServerTextMessage;

        console.log(message);

        if (message.to === "chat") {
          setConsoleMessages((consoleMessages) => {
            const newConsoleMessages = [...consoleMessages];
            newConsoleMessages.push(message.text);
            return newConsoleMessages;
          });
        } else {
          setUsers((users) => {
            const newUsers = [...users];
            const { from, text } = message;
            const newMessage: Message = {
              date: new Date().toLocaleDateString(),
              isIncoming: true,
              message: text,
            };
            let matchUser: User = users.find((el) => el.name === from);
            if (!matchUser) {
              matchUser = {
                name: from,
                messages: [newMessage],
                newMessages: true,
              };
              newUsers.push(matchUser);
            } else {
              matchUser.messages.push(newMessage);
              matchUser.newMessages = true;
            }
            saveUsers(newUsers);
            return newUsers;
          });
        }
      }
    };

    sockets.ghostSocket.addEventListener("package", onPacket);

    return () => {
      sockets.ghostSocket.removeEventListener("package", onPacket);
    };
  }, [setUnreadMessages, sockets.ghostSocket, users]);

  const closeChat = () => {
    setSelectedUser(null);
    setOpenedChat("");
  };

  return (
    <Card className="chat">
      <Card.Content>
        <Card.Header>
          {openedChat !== "" ? (
            <>
              <Icon name="angle left" onClick={closeChat}></Icon>
              {label}
            </>
          ) : (
            label
          )}
        </Card.Header>
      </Card.Content>
      <Card.Content>{content}</Card.Content>
    </Card>
  );
};
