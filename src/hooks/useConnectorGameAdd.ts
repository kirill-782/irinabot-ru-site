import { GHostWebSocket } from "./../services/GHostWebsocket";
import { ConnectorWebsocket } from "./../services/ConnectorWebsocket";
import { useEffect } from "react";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_UDP_ANSWER } from "../models/websocket/HeaderConstants";
import { ServerUDPAnswer } from "../models/websocket/ServerUDPAnswer";

import { fromByteArray } from "base64-js";

interface useConnectorGameAddOptions {
    ghostSocket: GHostWebSocket;
    connectorSocket: ConnectorWebsocket;
}

export const useConnectorGameAdd = ({ ghostSocket, connectorSocket }: useConnectorGameAddOptions) => {
    //const {language} = useContext(AppRuntimeSettingsContext);
    //const lang = language.languageRepository;

    useEffect(() => {
        const onUDPGameAddPackage = (data) => {
            if (
                data.detail.package.type === DEFAULT_UDP_ANSWER &&
                data.detail.package.context === DEFAULT_CONTEXT_HEADER_CONSTANT
            ) {
                const gameParams = new URLSearchParams();
                const gameData = data.detail.package as ServerUDPAnswer;

                console.log(gameData);

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

                console.log("irinat://addgame?" + gameParams.toString());

                document.location.href = "irinat://addgame?" + gameParams.toString();
            }
        };

        ghostSocket.addEventListener("package", onUDPGameAddPackage);

        return () => {
            ghostSocket.removeEventListener("package", onUDPGameAddPackage);
        };
    }, [ghostSocket, connectorSocket]);
};
