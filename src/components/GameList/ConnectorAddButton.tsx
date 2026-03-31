import { Button, Form, Icon, IconProps, Modal, SemanticShorthandItem } from "semantic-ui-react";
import React, { useContext, useRef, useState } from "react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../../context";
import { AuthContext } from "../../context";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { ClientRequestUDPGameConverter } from "../../models/websocket/ClientRequestUDPGame";

declare function ym(id: number, type: string, event: string): void;

interface ConnectorAddButtonProps {
    game: GameListGame;
}

function ConnectorAddButton({ game }: ConnectorAddButtonProps) {
    const sockets = useContext(WebsocketContext);
    const auth = useContext(AuthContext).auth;
    const buttonWrapperRef = useRef<HTMLSpanElement>(null);

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [buttonOffset, setButtonOffset] = useState({ x: 0, y: 0 });

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const requestConnectorGame = (password?: string) => {
        const converter = new ClientRequestUDPGameConverter();
        sockets.ghostSocket.send(
            converter.assembly({
                gameId: game.gameCounter,
                isPrivateKey: false,
                password: password || "",
            })
        );
    };

    const onButtonClick = () => {
        ym(54068152, "reachGoal", "GAMELIST_CONNECTOR_BROADCAST");
        if (game.gameFlags.hasPassword) setPasswordModalOpen(true);
        else requestConnectorGame();
    };

    const isEnabled = auth.currentAuth !== null;

    const onButtonMouseEnter = () => {
        const now = new Date();
        const isAprilFirst = now.getMonth() === 3 && now.getDate() === 1;

        if (!isEnabled || !isAprilFirst || Math.random() >= 0.25) return;

        const buttonWrapper = buttonWrapperRef.current;
        if (!buttonWrapper) return;

        const rect = buttonWrapper.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - rect.width);
        const maxTop = Math.max(0, window.innerHeight - rect.height);
        const nextLeft = Math.random() * maxLeft;
        const nextTop = Math.random() * maxTop;
        const baseLeft = rect.left - buttonOffset.x;
        const baseTop = rect.top - buttonOffset.y;

        setButtonOffset({
            x: nextLeft - baseLeft,
            y: nextTop - baseTop,
        });
    };

    if (game.gameFlags.started && !game.gameFlags.canJoinAsObserver) return null;

    const icon = ((): SemanticShorthandItem<IconProps> => {
        if (game.gameFlags.hasPassword) return "lock";

        if (game.gameFlags.started) return "eye";

        return "gamepad";
    })();

    return (
        <>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <Modal
                    open={passwordModalOpen}
                    closeIcon
                    onClose={() => {
                        setPasswordModalOpen(false);
                    }}
                >
                    <Modal.Header>{lang.connectorAddButtonEnterClosedGame}</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Input
                                label={lang.connectorAddButtonPassword}
                                value={password}
                                onChange={(_, data) => {
                                    setPassword(data.value);
                                }}
                            ></Form.Input>
                            <Form.Button
                                color="green"
                                onClick={() => {
                                    requestConnectorGame(password);
                                    setPasswordModalOpen(false);
                                }}
                            >
                                <Icon name="check"></Icon>
                                {lang.connectorAddButtonEnter}
                            </Form.Button>
                        </Form>
                    </Modal.Content>
                </Modal>
            </div>
            <span
                ref={buttonWrapperRef}
                style={{
                    display: "inline-block",
                    position: "relative",
                    transform: `translate(${buttonOffset.x}px, ${buttonOffset.y}px)`,
                    zIndex: buttonOffset.x !== 0 || buttonOffset.y !== 0 ? 1 : undefined,
                }}
            >
                <Button
                    icon={icon}
                    disabled={!isEnabled}
                    color={isEnabled ? "green" : "red"}
                    basic
                    size="mini"
                    onClick={onButtonClick}
                    onMouseEnter={onButtonMouseEnter}
                />
            </span>
        </>
    );
}

export default ConnectorAddButton;
