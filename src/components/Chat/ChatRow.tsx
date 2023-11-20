import React, { SyntheticEvent, useEffect, useState } from "react";
import { Divider, Feed, Icon, Label } from "semantic-ui-react";
import { SelectionType, User } from "./interfaces";
import LanguageKey from "./../LanguageKey";

interface ChatRowProps {
    user: User;
    onSelectonChange: (type: SelectionType, user?: User) => void;
    onDeleteUser: (user: User) => void;
}

function ChatRow({ user, onSelectonChange, onDeleteUser }: ChatRowProps) {
    const [confirmRemove, setConfirmRemove] = useState<User | undefined>();

    const handleRemoveUser = (ev: SyntheticEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        setConfirmRemove(user);
    };

    const removeUser = (ev: SyntheticEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        onDeleteUser(user);
    };

    const handleSelectUser = (ev: SyntheticEvent) => {
        onSelectonChange(SelectionType.USER, user);
    };

    useEffect(() => {
        if (confirmRemove) {
            const abortRemoveTimeOut = setTimeout(() => {
                setConfirmRemove(undefined);
            }, 2000);

            return () => {
                clearTimeout(abortRemoveTimeOut);
            };
        }
    }, [confirmRemove]);

    const lastMessage = user.messages.length ? user.messages[user.messages.length - 1] : null;

    return (
        <React.Fragment key={user.name}>
            <Feed.Event onClick={(ev) => handleSelectUser(ev)}>
                <Feed.Label icon="user" />
                <Feed.Content>
                    <Feed.Summary>
                        {user.name}
                        <Feed.Date content={user.messages.length ? user.messages[user.messages.length - 1].date : ""} />
                        {confirmRemove === user ? (
                            <span className="remove-user-button" onClick={(ev) => removeUser(ev)}>
                                <LanguageKey stringId="chatRowRemoveConfirm"></LanguageKey>
                            </span>
                        ) : (
                            <Icon name="remove" onClick={(ev) => handleRemoveUser(ev)} />
                        )}
                    </Feed.Summary>
                    {lastMessage ? (
                        <Feed.Extra>
                            {user.newMessages && <Label className="chat-label-icon" circular color="red" empty />}
                            {lastMessage.isIncoming ? `${user.name}: ` : ""}
                            {lastMessage.message}
                        </Feed.Extra>
                    ) : (
                        <LanguageKey stringId="chatRowNoMessages"></LanguageKey>
                    )}
                </Feed.Content>
            </Feed.Event>
            <Divider />
        </React.Fragment>
    );
}

export default ChatRow;
