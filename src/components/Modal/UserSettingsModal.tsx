import {
  Button,
  Container,
  Header,
  Icon,
  Item,
  List,
  Modal,
  Image,
  Form,
} from "semantic-ui-react";
import { useContext, useEffect, useState } from "react";
import { AuthContext, WebsocketContext } from "./../../context/index";
import { AuthMethod, AviableAuthMethods } from "../../config/AuthMethods";
import { toast } from "@kokomi/react-semantic-toasts";
import { ClientDeleteIntegrationConverter } from "./../../models/websocket/ClientDeleteIntegration";
import { ClientAddIntegrationByTokenConverter } from "./../../models/websocket/ClientAddIntegrationByToken";
import { ClientSetConnectorNameConverter } from "./../../models/websocket/ClientSetConnectorName";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import {
  GLOBAL_CONTEXT_HEADER_CONSTANT,
  GLOBAL_BNET_KEY,
} from "./../../models/websocket/HeaderConstants";
import { ServerBnetKey } from "./../../models/websocket/ServerBnetKey";
import { ClientRequestBnetKeyConverter } from "./../../models/websocket/ClientRequestBnetKey";
import React from "react";

const BNET_INTEGRATION_TYPE = 0;

function UserSettingsModal(props) {
  const auth = useContext(AuthContext).auth;
  const sockets = useContext(WebsocketContext);

  const [connectorName, setConnectorName] = useState("");

  useEffect(() => {
    const onPackage = (data: GHostPackageEvent) => {
      if (
        data.detail.package.context === GLOBAL_CONTEXT_HEADER_CONSTANT &&
        data.detail.package.type === GLOBAL_BNET_KEY
      ) {
        const bnetKey = data.detail.package as ServerBnetKey;

        toast({
          title: "Привязка PVPGn аккаунта",
          description:
            "Отправьте боту на канал следующую команду: !confirm " +
            bnetKey.key,
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

    const oauthWindow = window.open(
      data.oauthEndpoint + "?" + urlParser.toString(),
      state,
      "popup"
    );

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
              title: "Ошибка",
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

  const onWarcraftIIIButtonClick = () => {
    if (auth.currentAuth.bnetName) {
      const converter = new ClientDeleteIntegrationConverter();
      sockets.ghostSocket.send(
        converter.assembly({ tokenType: BNET_INTEGRATION_TYPE })
      );
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
    sockets.ghostSocket.send(
      converter.assembly({ connectorName: connectorName })
    );
    setConnectorName("");
  };

  if (auth.currentAuth === null) return null;

  return (
    <Modal {...props}>
      <Modal.Header>Настройки</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Подключение аккаунтов</Header>
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
                <Button
                  onClick={() => onSaveButtonClick()}
                  style={{ marginLeft: 10 }}
                  color="green"
                >
                  Сохранить
                </Button>
              </Form.Group>
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
}

export default UserSettingsModal;
