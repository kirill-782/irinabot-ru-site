import { Button } from "semantic-ui-react";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { useContext, useState } from "react";
import { useEffect } from "react";
import { AppRuntimeSettingsContext, AuthContext, WebsocketContext } from "../../context";
import { ClientRequestUDPGameConverter } from "../../models/websocket/ClientRequestUDPGame";
import React from "react";

interface MapGameJoinButtonProps {
    mapId: number;
    className?: string;
}

declare function ym(id: number, type: string, event: string): void;

function MapGameJoinButton({ mapId, className }: MapGameJoinButtonProps) {
    const [foundGame, setFoundGame] = useState<GameListGame>();

    const sockets = useContext(WebsocketContext);
    const auth = useContext(AuthContext).auth;

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const requestConnectorGame = () => {
        if (!foundGame) return;

        ym(54068152, "reachGoal", "MAP_GAMEJOIN_BUTTON");

        const converter = new ClientRequestUDPGameConverter();
        sockets.ghostSocket.send(
            converter.assembly({
                gameId: foundGame.gameCounter,
                isPrivateKey: false,
                password: "",
            })
        );
    };

    const isEnabled = auth.currentAuth !== null;
    

    return (
        <Button
            className={className}
            disabled={!foundGame || !isEnabled}
            icon="gamepad"
            title={lang.gameJoinButton}
            onClick={() => {
                requestConnectorGame();
            }}
        ></Button>
    );
}

export default MapGameJoinButton;
