import React, { useContext, useState } from "react";
import { Divider, Feed, Form } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import ChatRow from "./ChatRow";
import { SelectionType, User } from "./interfaces";

interface ChatListProps {
    users: User[];
    onNewUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
    onSelectonChange: (type: SelectionType, user?: User) => void;
}

function ChatList({ users, onDeleteUser, onNewUser, onSelectonChange }: ChatListProps) {
    const [newUsername, setNewUsername] = useState<string>("");

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const handleNewChat = () => {
        const newUser: User = {
            name: newUsername,
            messages: [],
            newMessages: false
        };

        onNewUser(newUser);
        setNewUsername("");
    };

    return (
        <Feed className="chat-feed">
            {users.map((user) => {
                return (
                    <ChatRow
                        key={user.name}
                        user={user}
                        onSelectonChange={onSelectonChange}
                        onDeleteUser={onDeleteUser}
                    />
                );
            })}
            <Feed.Event onClick={() => onSelectonChange(SelectionType.CONSOLE)}>
                <Feed.Label icon="pencil" />
                <Feed.Content date={lang.chatListConsoleBotTitle} summary={lang.chatListConsoleBotDescription} />
            </Feed.Event>
            <Divider />
            <Form>
                <Form.Group widths="equal">
                    <Form.Input
                        placeholder={lang.chatListNicknameLabel}
                        value={newUsername}
                        onChange={(ev) => setNewUsername(ev.target.value)}
                    />
                </Form.Group>
                <Form.Button
                        content={lang.chatListStartChat}
                        labelPosition="left"
                        icon="edit"
                        primary
                        onClick={handleNewChat}
                    />
            </Form>
        </Feed>
    );
}

export default ChatList;
