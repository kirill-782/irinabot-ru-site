import React, { useCallback, useContext, useEffect, useState } from "react";
import { Card, Icon } from "semantic-ui-react";
import { User, ChatProps, Message, SelectionType } from "./interfaces";
import "./chat.scss";
import { UserChat } from "./UserChat";
import { ConsoleBot } from "./ConsoleBot";
import { AppRuntimeSettingsContext, WebsocketContext } from "./../../context";
import { ClientTextMessageConverter } from "./../../models/websocket/ClientTextMessage";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_NEW_MESSAGE } from "../../models/websocket/HeaderConstants";
import { ServerTextMessage } from "../../models/websocket/ServerTextMessage";
import ChatList from "./ChatList";

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
        stringifyUsers = JSON.stringify(users.map((el) => ({ ...el, messages: [] })));
    }
    localStorage.setItem("chat-users", stringifyUsers);
};

export const Chat: React.FC<ChatProps> = ({ setUnreadMessages, open, setOpen }) => {
    const sockets = useContext(WebsocketContext);
    const [users, setUsers] = useState(getUsers());
    const [consoleMessages, setConsoleMessages] = useState<string[]>([]);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openedChat, setOpenedChat] = useState<"chat" | "console" | "">("");

    const openChat = useCallback(
        (nickname: string) => {
            setOpenedChat("chat");

            const user = users.find((user) => {
                if (user.name.toLocaleLowerCase() === nickname.toLocaleLowerCase()) return true;
            });

            if (user) setSelectedUser(user);
            else {
                const newUser = {
                    newMessages: false,
                    name: nickname,
                    messages: [],
                };

                onNewUser(newUser);
                setSelectedUser(newUser);
            }

            setOpen(true);
        },
        [setOpenedChat, setSelectedUser, users, setOpen]
    );

    const { chat } = useContext(AppRuntimeSettingsContext);

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    useEffect(() => {
        chat.setSelectUser({ selectUser: openChat });
    }, [openChat, chat.setSelectUser]);

    const sendMessage = (user: User, message: string) => {
        const newUsers = [...users];
        const matchUser = newUsers.find((el) => el === user);
        if (matchUser) {
            matchUser.messages.push({
                message,
                date: new Date().toLocaleDateString(),
                isIncoming: false,
            });
        }

        const converter = new ClientTextMessageConverter();
        sockets.ghostSocket.send(converter.assembly({ from: "whisper", to: user.name, text: message }));
        setSelectedUser(user);
    };

    const sendConsoleMessage = (message: string) => {
        const converter = new ClientTextMessageConverter();
        sockets.ghostSocket.send(converter.assembly({ from: "chat", to: "", text: message }));
    };

    const onNewUser = (user: User) => {
        const existUser = users.find((i) => {
            if (user.name === i.name) return true;

            return false;
        });

        if (existUser) return;

        const newUsers = [...users];
        newUsers.push(user);

        setUsers(newUsers);
    };

    const onDeleteUser = (user: User) => {
        setUsers(users.filter((el) => el !== user));
    };

    const onSelectonChange = (type: SelectionType, user?: User) => {
        if (type === SelectionType.CONSOLE) setOpenedChat("console");
        else if (type === SelectionType.USER && user) {
            setOpenedChat("chat");
            setSelectedUser(user);
            setUsers((users) => {
                return users.map((i) => {
                    if (i.name === user.name) i.newMessages = false;
                    return i;
                });
            });
        }
    };

    let content, label;

    switch (openedChat) {
        case "chat":
            if (selectedUser) {
                label = selectedUser.name;
                content = <UserChat user={selectedUser} sendMessage={sendMessage} />;
            }
            break;
        case "console":
            label = lang.chatConsole;
            content = <ConsoleBot messages={consoleMessages} sendConsoleMessage={sendConsoleMessage} />;
            break;
        default:
            label = lang.chatChat;
            content = (
                <ChatList
                    users={users}
                    onDeleteUser={onDeleteUser}
                    onSelectonChange={onSelectonChange}
                    onNewUser={onNewUser}
                />
            );
            break;
    }

    useEffect(() => {
        setUnreadMessages(users.some((el) => el.newMessages));
        saveUsers(users);
    }, [users]);

    useEffect(() => {
        const onPacket = (packet: GHostPackageEvent) => {
            if (
                packet.detail.package.context === DEFAULT_CONTEXT_HEADER_CONSTANT &&
                packet.detail.package.type === DEFAULT_NEW_MESSAGE
            ) {
                const message = packet.detail.package as ServerTextMessage;

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
                        let matchUser: User | undefined = users.find((el) => el.name === from);
                        if (!matchUser) {
                            matchUser = {
                                name: from,
                                messages: [newMessage],
                                newMessages: true,
                            };
                            newUsers.push(matchUser);
                        } else {
                            matchUser.messages.push(newMessage);
                            if (selectedUser !== matchUser) {
                                matchUser.newMessages = true;
                            }
                        }

                        return newUsers;
                    });

                    // Play Sound

                    const audio = new Audio("/sound/162464__kastenfrosch__message.mp3");
                    audio.volume = 0.8;
                    audio.play();
                }
            }
        };

        sockets.ghostSocket.addEventListener("package", onPacket);

        return () => {
            sockets.ghostSocket.removeEventListener("package", onPacket);
        };
    }, [selectedUser, setUnreadMessages, sockets.ghostSocket, users]);

    const closeChat = () => {
        setSelectedUser(null);
        setOpenedChat("");
    };

    if (!open) return null;

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
                    <Icon
                        style={{ float: "right", cursor: "pointer" }}
                        name="x"
                        onClick={() => {
                            setOpen(false);
                        }}
                    />
                </Card.Header>
                <Card.Description>
                    {content}
                </Card.Description>
            </Card.Content>
        </Card>
    );
};
