import { Button, Form, Icon, Modal } from "semantic-ui-react";
import React, { useContext, useState } from "react";
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

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState("");

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

    if (game.gameFlags.started) return null;

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
            <Button
                icon={game.gameFlags.hasPassword ? "lock" : "gamepad"}
                disabled={!isEnabled}
                color={isEnabled ? "green" : "red"}
                basic
                size="mini"
                onClick={onButtonClick}
            />
        </>
    );
}

export default ConnectorAddButton;
