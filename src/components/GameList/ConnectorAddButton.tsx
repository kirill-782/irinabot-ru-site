import { Button, Form, Icon, Modal } from "semantic-ui-react";
import React, { useContext, useState } from "react";
import { AppRuntimeSettingsContext, RestContext, WebsocketContext } from "../../context";
import { AuthContext } from "../../context";
import { ClientRequestUDPGameConverter } from "../../models/websocket/ClientRequestUDPGame";
import { GameDataShort } from "../../models/rest/Game";
import { toast } from "@kokomi/react-semantic-toasts";

declare function ym(id: number, type: string, event: string): void;

interface ConnectorAddButtonProps {
    game: GameDataShort;
}

function ConnectorAddButton({ game }: ConnectorAddButtonProps) {
    const auth = useContext(AuthContext).auth;
    const { sendGame } = useContext(AppRuntimeSettingsContext).connector;
    const { gamesApi } = useContext(RestContext);

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState("");

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const requestConnectorGame = async (password?: string) => {
        try {
            const gameData = await gamesApi.getGame({ gameId: game.id, password });
            sendGame(gameData);
        } catch (e) {
            toast({
                title: "Ошибка удаления игры",
                description: e.toString(),
            });
        }
    };

    const onButtonClick = () => {
        ym(54068152, "reachGoal", "GAMELIST_CONNECTOR_BROADCAST");
        if (game.passwordRequired) setPasswordModalOpen(true);
        else requestConnectorGame();
    };

    const isEnabled = auth.currentAuth !== null;

    if (game.started) return null;

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
                icon={game.passwordRequired ? "lock" : "gamepad"}
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
