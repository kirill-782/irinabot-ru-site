import React, { useContext } from "react";
import { Button } from "semantic-ui-react";
import { AppRuntimeSettingsContext, AuthContext, RestContext } from "../../context";
import { AccessMaskBit } from "../Modal/AccessMaskModal";
import { GameDataShort } from "../../models/rest/Game";
import { toast } from "@kokomi/react-semantic-toasts";

interface SendSignalButtonProps {
    game: GameDataShort;
}

function SendSignalButton({ game }: SendSignalButtonProps) {
    const auth = useContext(AuthContext).auth;
    const { gamesApi } = useContext(RestContext);

    const sendDeleteRequest = () => {
        gamesApi.deleteGame({ gameId: game.id }).catch((e) => {
            toast({
                title: "Ошибка получения данных игры",
                description: e.toString(),
            });
        });
    };

    if (
        auth.currentAuth?.connectorId.toString() !== game.creatorUserId &&
        !auth.accessMask.hasAccess(AccessMaskBit.ACCESS_ROOT)
    )
        return null;

    return (
        <Button
            icon="x"
            basic
            size="mini"
            color="red"
            onClick={() => {
                sendDeleteRequest();
            }}
        />
    );
}

export default SendSignalButton;
