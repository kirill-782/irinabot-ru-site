import { Button, Grid, Icon, List, Popup } from "semantic-ui-react";
import { GameListPlayer } from "../../models/websocket/ServerGameList";
import { memo, useContext, useState } from "react";
import "./GameListPlayerItem.scss";
import { AppRuntimeSettingsContext } from "../../context";
import React from "react";
import WarcraftIIIText from "../WarcraftIIIText";

const realmToText = {
    "178.218.214.114": "iCCup",
    connector: "IrInA Connector",
    "127.0.0.1": "Игрок другой платформы",
};

interface GameListPlayerItemProps {
    player: GameListPlayer;
}

const getClassColorByPlayer = ({ colour }) => {
    switch (colour) {
        case 0:
            return "red";
        case 1:
            return "blue";
        case 2:
            return "teal";
        case 3:
            return "purple";
        case 4:
            return "yellow";
        case 5:
            return "orange";
        case 6:
            return "green";
        case 7:
            return "pink";
        case 8:
            return "gray";
        case 9:
            return "light-blue";
        case 10:
            return "dark-green";
        case 11:
            return "brown";
        case 12:
            return "maroon";
        case 13:
            return "navy";
        case 14:
            return "turquoise";
        case 15:
            return "violet";
        case 16:
            return "wheat";
        case 17:
            return "peach";
        case 18:
            return "mint";
        case 19:
            return "leavender";
        case 20:
            return "coal";
        case 21:
            return "snow";
        case 22:
            return "emerald";
        case 23:
            return "peanut";
        default:
            return "";
    }
};

function GameListPlayerItem({ player }: GameListPlayerItemProps) {
    const { chat } = useContext(AppRuntimeSettingsContext);

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const openUserChat = () => {
        if (chat.selectUser.selectUser) chat.selectUser.selectUser(player.name);
    };

    return (
        <Popup
            on="click"
            trigger={
                <List.Item
                    key={player.name}
                    as="a"
                    title={!realmToText[player.realm] ? player.realm : realmToText[player.realm]}
                    className={`player-name ${getClassColorByPlayer(player)}`}
                >
                    <WarcraftIIIText ignoreTags={["|n"]}>{player.name}</WarcraftIIIText>
                </List.Item>
            }
        >
            <Grid centered>
                <Grid.Row>
                    <Button
                        size="mini"
                        onClick={(e) => {
                            e.stopPropagation();
                            openUserChat();
                        }}
                    >
                        <Icon name="envelope"></Icon>
                        {lang.gameListPlayerItemSendMessage}
                    </Button>
                </Grid.Row>
            </Grid>
        </Popup>
    );
}

export default memo(GameListPlayerItem);
