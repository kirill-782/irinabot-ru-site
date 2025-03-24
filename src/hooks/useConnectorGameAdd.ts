import { ConnectorWebsocket } from "./../services/ConnectorWebsocket";
import { useCallback } from "react";

import { toast } from "@kokomi/react-semantic-toasts";
import copy from "clipboard-copy";
import { GameDataFull } from "../models/rest/Game";

interface useConnectorGameAddOptions {
    connectorSocket: ConnectorWebsocket;
    linkCopyMode: boolean;
}

function timeout(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(timeout);
        }, time);
    });
}

export const useConnectorGameAdd = ({ connectorSocket, linkCopyMode }: useConnectorGameAddOptions) => {
    return useCallback(
        (gameData: GameDataFull) => {
            const gameParams = new URLSearchParams();

            gameParams.append("token", gameData.token);
            gameParams.append("hostCounter", gameData.hostCounter.toString());
            gameParams.append("entryKey", gameData.entryKey.toString());
            gameParams.append("connectPort", gameData.connectPort.toString());
            gameParams.append("connectHost", gameData.connectHost);
            gameParams.append("gameName", gameData.name);
            gameParams.append("mapGameFlags", gameData.mapGameFlags);
            gameParams.append("mapWidth", gameData.mapWidth);
            gameParams.append("mapHeight", gameData.mapHeight);
            gameParams.append("mapCrc", gameData.mapCrc);
            gameParams.append("mapPath", gameData.mapPath);
            gameParams.append("hostName", gameData.hostName);
            gameParams.append("mapFileSha1", gameData.mapFileSha1);
            gameParams.append("version", gameData.gameVersion);
            gameParams.append("maxPlayers", gameData.maxPlayers.toString());
            gameParams.append("broadcast", gameData.broadcast.toString());

            if (gameData.broadcast) {
                gameParams.append("productId", gameData.productId);
                gameParams.append("versionPrefix", gameData.versionPrefix);
            } else if (gameData.broadcast === false) gameParams.append("domain", gameData.domain);

            gameParams.append("mapGameType", gameData.mapGameType.toString());

            const url = "irina://addgame?" + gameParams.toString();

            console.log(url);

            if (linkCopyMode) {
                copy(url)
                    .then(() => {
                        toast({
                            title: "Ссылка скопирована",
                            icon: "check",
                            time: 15000,
                            color: "green",
                            description: "Ссылка на игру скопирована. Вставьте её в коннектор",
                        });
                    })
                    .catch((e) => {
                        toast({
                            title: "Ошибка при копировании ссылки",
                            icon: "x",
                            time: 15000,
                            color: "red",
                            description: "Ошибка при копировании ссылки",
                        });
                    });
            } else {
                if (connectorSocket.isConnected() && connectorSocket.version == 7) {
                    connectorSocket.send(Uint8Array.from([2, ...new TextEncoder().encode(url), 0]));

                    toast({
                        title: "Запрос на добвление отправлен",
                        icon: "check",
                        time: 15000,
                        color: "green",
                        description: "Проверьте появилась ли игра в консольном коннекторе",
                    });
                } else {
                    const addGameResponse = fetch("http://127.0.0.1:44771/addgame?" + gameParams.toString());
                    const result = Promise.race([addGameResponse, timeout(1000)]);

                    result
                        .then((result: Awaited<typeof addGameResponse>) => {
                            if (result.status === 200) {
                                toast({
                                    title: "Игра добавлена",
                                    icon: "check",
                                    time: 15000,
                                    color: "green",
                                    description: "Разверните коннектор, чтобы продолжить",
                                });
                            }
                        })
                        .catch((e) => {
                            document.location.href = url;

                            toast({
                                title: "Запрос на добвление отправлен",
                                icon: "check",
                                time: 15000,
                                color: "green",
                                description: "Проверьте появилась ли игра в коннекторе",
                            });
                        });
                }
            }
        },
        [connectorSocket, linkCopyMode]
    );
};
