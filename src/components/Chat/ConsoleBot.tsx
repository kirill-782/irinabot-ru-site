import { Comment, Form, Button } from "semantic-ui-react";
import { SyntheticEvent, useContext, useState } from "react";
import React from "react";
import { AppRuntimeSettingsContext } from "../../context";

interface ConsoleProps {
    sendConsoleMessage(message: string): void;
    messages: string[];
}

export const ConsoleBot: React.FC<ConsoleProps> = ({ sendConsoleMessage, messages }) => {
    const [message, setMessage] = useState("");

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const handleClickSend = (e: SyntheticEvent) => {
        e.preventDefault();
        if (!message) {
            return;
        }
        setMessage("");
        sendConsoleMessage(message);
    };

    const handleKeyTextarea = (e: KeyboardEvent) => {
        if (e.code === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!message) {
                return;
            }
            setMessage("");
            sendConsoleMessage(message);
        }
    };

    return (
        <Comment.Group className="user-chat">
            <div>
                {messages.map((message, index) => (
                    <Comment key={index}>
                        <Comment.Author as="a">Irina</Comment.Author>
                        <Comment.Content>
                            <Comment.Text>{message}</Comment.Text>
                        </Comment.Content>
                    </Comment>
                ))}
            </div>
            <div className="chat-reply">
                <Form reply>
                    <Form.TextArea
                        rows={2}
                        className="chat-textarea"
                        onChange={(ev) => setMessage(ev.target.value)}
                        onKeyPress={handleKeyTextarea}
                        value={message}
                    />
                    <Button content={lang.send} labelPosition="left" icon="edit" primary onClick={handleClickSend} />
                </Form>
            </div>
        </Comment.Group>
    );
};
