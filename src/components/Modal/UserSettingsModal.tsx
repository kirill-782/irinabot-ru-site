import { Button, Container, Header, Icon, Item, List, Modal, Image, Form } from "semantic-ui-react";
import { useContext, useEffect, useState } from "react";
import { AppRuntimeSettingsContext, AuthContext, WebsocketContext } from "../../context";
import { AuthMethod, AviableAuthMethods } from "../../config/AuthMethods";
import { toast } from "@kokomi/react-semantic-toasts";
import { ClientDeleteIntegrationConverter } from "../../models/websocket/ClientDeleteIntegration";
import { ClientAddIntegrationByTokenConverter } from "../../models/websocket/ClientAddIntegrationByToken";
import { ClientSetConnectorNameConverter } from "../../models/websocket/ClientSetConnectorName";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import {
    GLOBAL_CONTEXT_HEADER_CONSTANT,
    GLOBAL_BNET_KEY,
    GLOBAL_ADD_INTEGRATION_RESPONSE,
} from "../../models/websocket/HeaderConstants";
import { ServerBnetKey } from "../../models/websocket/ServerBnetKey";
import { ClientRequestBnetKeyConverter } from "../../models/websocket/ClientRequestBnetKey";

import React from "react";
import NicknameColorPicker from "../NicknameColorPicker";
import { ClientNickanameColorChangeConverter } from "../../models/websocket/ClientNickanameColorChange";

const BNET_INTEGRATION_TYPE = 0;

function UserSettingsModal(props) {
    const auth = useContext(AuthContext).auth;
    const sockets = useContext(WebsocketContext);

    const [connectorName, setConnectorName] = useState("");

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const t = language.getString;

    const nicknameColor = (() => {
        const colors = auth.currentAuth.nicknamePrefix.match(/\|c[0-9a-f]{2}([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);

        if (colors) {
            return {
                r: parseInt(colors[1], 16),
                g: parseInt(colors[2], 16),
                b: parseInt(colors[3], 16),
            };
        }
    })();

    useEffect(() => {
        const onPackage = (data: GHostPackageEvent) => {
            if (
                data.detail.package.context === GLOBAL_CONTEXT_HEADER_CONSTANT &&
                data.detail.package.type === GLOBAL_BNET_KEY
            ) {
                const bnetKey = data.detail.package as ServerBnetKey;

                toast({
                    title: lang.userSettingsModalPvpGnToastHeader,
                    description: t("userSettingsModalPvpGnToastDescription", { key: bnetKey.key }),
                    time: 20000,
                });
            }
        };

        sockets.ghostSocket.addEventListener("package", onPackage);

        return () => {
            sockets.ghostSocket.removeEventListener("package", onPackage);
        };
    }, [sockets]);

    const authByOauth = (data: AuthMethod) => {
        // Build oauth url

        const state = (Math.random() + 1).toString(36).substring(2);

        const urlParser = new URLSearchParams();
        urlParser.append("client_id", data.client_id);
        urlParser.append("scope", data.scope);
        urlParser.append("response_type", "token");
        urlParser.append("redirect_uri", window.location.origin + "/oauth");
        urlParser.append("state", state);

        const oauthWindow = window.open(data.oauthEndpoint + "?" + urlParser.toString(), state, "popup");

        if (!oauthWindow) return;

        const onStorage = (e: StorageEvent) => {
            const storageKey = e.key;
            const storageNewValue = e.newValue;

            if (storageNewValue && storageKey) {
                if (storageKey.startsWith(state)) {
                    if (storageKey.substring(state.length + 1) === "token") {
                        const converter = new ClientAddIntegrationByTokenConverter();
                        sockets.ghostSocket.send(
                            converter.assembly({
                                tokenType: data.type,
                                token: storageNewValue,
                            })
                        );
                    } else {
                        toast({
                            title: lang.error,
                            description: storageNewValue,
                            type: "error",
                            time: 10000,
                        });
                    }

                    window.localStorage.removeItem(e.key);
                }
            }
        };

        window.addEventListener("storage", onStorage);
        oauthWindow.addEventListener("close", () => {
            window.removeEventListener("storage", onStorage);
        });
    };

    const onColorChanged = (color: number) => {
        const converter = new ClientNickanameColorChangeConverter();
        sockets.ghostSocket.send(
            converter.assembly({
                color,
            })
        );
    };

    const onWarcraftIIIButtonClick = () => {
        if (auth.currentAuth.bnetName) {
            const converter = new ClientDeleteIntegrationConverter();
            sockets.ghostSocket.send(converter.assembly({ tokenType: BNET_INTEGRATION_TYPE }));
        } else {
            const converter = new ClientRequestBnetKeyConverter();
            sockets.ghostSocket.send(converter.assembly({}));
        }
    };

    const onIntegrationButtonClick = (method: AuthMethod) => {
        if (auth.currentAuth[method.authObjectProperty]) {
            const converter = new ClientDeleteIntegrationConverter();
            sockets.ghostSocket.send(converter.assembly({ tokenType: method.type }));
        } else authByOauth(method);
    };

    const isIntegrationButtonEnabled = (method: AuthMethod) => {
        if (!auth.currentAuth[method.authObjectProperty]) return true;

        if (auth.authCredentials.type === method.type) return false;

        if (auth.currentAuth.mainType === method.type) return false;

        return true;
    };

    const onConnectorNameChange = (name: string) => {
        if (name.startsWith("#")) return;

        const textEncoder = new TextEncoder();
        if (textEncoder.encode(name).length > 15) return;

        setConnectorName(name);
    };

    const onSaveButtonClick = () => {
        const converter = new ClientSetConnectorNameConverter();
        sockets.ghostSocket.send(converter.assembly({ connectorName: connectorName }));
        setConnectorName("");
    };

    if (auth.currentAuth === null) return null;

    return (
        <Modal {...props}>
            <Modal.Header>{lang.userSettingsModalHeader}</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    <Header>{lang.userSettingsModalConnectHeader}</Header>
                    <Container>
                        <Button onClick={onWarcraftIIIButtonClick} basic color="green">
                            Warcraft III
                        </Button>
                        {AviableAuthMethods.map((e) => {
                            return (
                                <Button
                                    onClick={() => {
                                        onIntegrationButtonClick(e);
                                    }}
                                    key={e.type}
                                    disabled={!isIntegrationButtonEnabled(e)}
                                    color={e.color}
                                >
                                    <Icon name={e.icon}></Icon>
                                    {e.name}
                                </Button>
                            );
                        })}
                    </Container>
                    <List size="medium">
                        <Item>
                            <Image avatar>
                                <Icon name="hashtag"></Icon>
                            </Image>
                            {auth.currentAuth.connectorId}
                        </Item>
                        {auth.currentAuth.bnetName.length > 0 && (
                            <Item>
                                <Image avatar>
                                    <Icon name="ambulance"></Icon>
                                </Image>
                                {auth.currentAuth.bnetName}
                            </Item>
                        )}
                        {auth.currentAuth.vkId > 0 && (
                            <Item>
                                <Image avatar>
                                    <Icon name="vk"></Icon>
                                </Image>
                                {auth.currentAuth.vkId}
                            </Item>
                        )}
                        {auth.currentAuth.discordId.length > 0 && (
                            <Item>
                                <Image avatar>
                                    <Icon name="discord"></Icon>
                                </Image>
                                {auth.currentAuth.discordId}
                            </Item>
                        )}
                    </List>
                    <Form>
                        <Form.Field>
                            <label>Nickname IrInA connector</label>
                            <Form.Group widths="equal">
                                <Form.Input
                                    placeholder={auth.currentAuth.connectorName}
                                    value={connectorName}
                                    onChange={(event, data) => {
                                        onConnectorNameChange(data.value);
                                    }}
                                ></Form.Input>
                                <Button onClick={() => onSaveButtonClick()} style={{ marginLeft: 10 }} color="green">
                                    {lang.save}
                                </Button>
                            </Form.Group>
                        </Form.Field>
                        <NicknameColorPicker
                            disabled={!auth.accessMask.hasAccess(1)}
                            nickname={connectorName || auth.currentAuth.connectorName}
                            onColorChanged={onColorChanged}
                            defaultColor={nicknameColor}
                        ></NicknameColorPicker>
                    </Form>
                </Modal.Description>
            </Modal.Content>
        </Modal>
    );
}

export default UserSettingsModal;
