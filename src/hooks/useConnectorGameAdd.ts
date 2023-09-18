import { GHostWebSocket } from "./../services/GHostWebsocket";
import { ConnectorWebsocket } from "./../services/ConnectorWebsocket";
import { useEffect, useRef, useState, useContext } from "react";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_UDP_ANSWER } from "../models/websocket/HeaderConstants";
import { ServerUDPAnswer } from "../models/websocket/ServerUDPAnswer";

import { fromByteArray } from "base64-js";
import { toast } from "@kokomi/react-semantic-toasts";
import copy from "clipboard-copy";
import { AppRuntimeSettingsContext } from "../context";

interface useConnectorGameAddOptions {
    ghostSocket: GHostWebSocket;
    connectorSocket: ConnectorWebsocket;
    linkCopyMode: boolean
}

function timeout(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(timeout);
        }, time)
    });
}

export const useConnectorGameAdd = ({ ghostSocket, connectorSocket, linkCopyMode }: useConnectorGameAddOptions) => {

    useEffect(() => {
        const onUDPGameAddPackage = (data) => {
            if (
                data.detail.package.type === DEFAULT_UDP_ANSWER &&
                data.detail.package.context === DEFAULT_CONTEXT_HEADER_CONSTANT
            ) {
                const gameParams = new URLSearchParams();
                const gameData = data.detail.package as ServerUDPAnswer;

                gameParams.append("token", gameData.token);
                gameParams.append("hostCounter", gameData.hostCounter.toString());
                gameParams.append("entryKey", gameData.entryKey.toString());
                gameParams.append("connectPort", gameData.connectPort.toString());
                gameParams.append("connectHost", gameData.connectHost);
                gameParams.append("gameName", gameData.gameName);
                gameParams.append("mapGameFlags", fromByteArray(Uint8Array.from(gameData.mapGameFlags)));
                gameParams.append("mapWidth", fromByteArray(Uint8Array.from(gameData.mapWidth)));
                gameParams.append("mapHeight", fromByteArray(Uint8Array.from(gameData.mapHeight)));
                gameParams.append("mapCrc", fromByteArray(Uint8Array.from(gameData.mapCrc)));
                gameParams.append("mapPath", gameData.mapPath);
                gameParams.append("hostName", gameData.hostName);
                gameParams.append("mapFileSha1", fromByteArray(Uint8Array.from(gameData.mapFileSha1)));
                gameParams.append("version", gameData.version);
                gameParams.append("maxPlayers", gameData.maxPlayers.toString());
                gameParams.append("broadcast", gameData.broadcast.toString());

                if (gameData.broadcast) {
                    gameParams.append("productId", fromByteArray(Uint8Array.from(gameData.productId)));
                    gameParams.append("versionPrefix", fromByteArray(Uint8Array.from(gameData.versionPrefix)));
                } else if (gameData.broadcast === false) gameParams.append("domain", gameData.domain);

                gameParams.append("mapGameType", gameData.mapGameType.toString());

                const url = "irina://addgame?" + gameParams.toString();

                console.log(url);

                if (linkCopyMode) {
                    copy(url).then(() => {
                        toast({
                            title: "Ссылка скопирована",
                            icon: "check",
                            time: 15000,
                            color: "green",
                            description: "Ссылка на игру скопирована. Вставьте её в коннектор",
                        });
                    }).catch((e) => {
                        toast({
                            title: "Ошибка при копировании ссылки",
                            icon: "x",
                            time: 15000,
                            color: "red",
                            description: "Ошибка при копировании ссылки",
                        });
                    });
                } else {

                    if(connectorSocket.isConnected() && connectorSocket.version == 7) {
                        connectorSocket.send(Uint8Array.from([2, ...new TextEncoder().encode(url) , 0]));
                        
                        toast({
                            title: "Запрос на добвление отправлен",
                            icon: "check",
                            time: 15000,
                            color: "green",
                            description: "Проверьте появилась ли игра в консольном коннекторе",
                        });
                    }
                    else {
                        const addGameResponse = fetch("http://127.0.0.1:44771/addgame?" + gameParams.toString());
                        const result = Promise.race([addGameResponse, timeout(1000)]);
    
                        result.then((result:  Awaited<typeof addGameResponse>) => {
                            if(result.status === 200)
                            {
                                toast({
                                    title: "Игра добавлена",
                                    icon: "check",
                                    time: 15000,
                                    color: "green",
                                    description: "Разверните коннектор, чтобы продолжить",
                                });
                            }
                        }).catch((e)=>{
                            console.log("xD", e);
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

                if (connectorSocket.isConnected() && connectorSocket.version != 7) {
                    toast({
                        title: "Мы обновили коннектор",
                        icon: "warning",
                        time: 15000,
                        color: "orange",
                        description:
                            "Мы заметили, что у вас запущен старый коннектор. Если у вас не получается добавить игру - обновите коннектор",
                    });
                }
            }
        };

        ghostSocket.addEventListener("package", onUDPGameAddPackage);

        return () => {
            ghostSocket.removeEventListener("package", onUDPGameAddPackage);
        };
    }, [ghostSocket, connectorSocket, linkCopyMode]);
};
