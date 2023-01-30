import { Button, Grid, Header, Message, Modal, Table } from "semantic-ui-react";
import { useContext, useEffect, useState } from "react";
import { Autohost } from "../../models/websocket/ServerAutohostListResponse";
import { AppRuntimeSettingsContext, CacheContext, WebsocketContext } from "../../context";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import {
  DEFAULT_AUTOHOST_REMOVE_RESPONSE,
  DEFAULT_CONTEXT_HEADER_CONSTANT,
} from "../../models/websocket/HeaderConstants";
import { DEFAULT_AUTOHOST_LIST_RESPONSE } from "./../../models/websocket/HeaderConstants";
import { ServerAutohostListResponse } from "./../../models/websocket/ServerAutohostListResponse";
import { ClientAutohostListConverter } from "./../../models/websocket/ClientAutohostList";
import { ServerAutohostRemoveResponse } from "./../../models/websocket/ServerAutohostRemoveResponse";
import { toast } from "@kokomi/react-semantic-toasts";
import { ClientAutohostRemoveConverter } from "./../../models/websocket/ClientAutohostRemove";
import ConnectorId from "../ConnectorId";
import { ClientResolveConnectorIdsConverter } from "../../models/websocket/ClientResolveConnectorIds";
import React from "react";

export interface AutohostListModalProps {
  open: boolean;
  onClose: () => void;
}

function AutohostListModal({ open, onClose }: AutohostListModalProps) {
  const [autohosts, setAutohosts] = useState<Autohost[] | null>(null);

  const sockets = useContext(WebsocketContext);

  const removeAutohost = (autohostId: number) => {
    sockets.ghostSocket.send(
      new ClientAutohostRemoveConverter().assembly({
        autohostId,
      })
    );
  };

  const connectorCache = useContext(CacheContext).cachedConnectorIds;

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  useEffect(() => {
    if (!autohosts) return;

    const uncachedConnectorIds = autohosts
      .map((i) => {
        return i.spaceId;
      })
      .filter((i) => {
        return !connectorCache[i];
      });

    if (uncachedConnectorIds.length > 0) {
      sockets.ghostSocket.send(
        new ClientResolveConnectorIdsConverter().assembly({
          connectorIds: uncachedConnectorIds,
        })
      );
    }
  }, [autohosts, connectorCache, sockets.ghostSocket]);

  useEffect(() => {
    sockets.ghostSocket.send(new ClientAutohostListConverter().assembly({}));

    const onPacket = (packet: GHostPackageEvent) => {
      const packetData = packet.detail.package;

      if (
        packetData.context === DEFAULT_CONTEXT_HEADER_CONSTANT &&
        packetData.type === DEFAULT_AUTOHOST_LIST_RESPONSE
      ) {
        const response = packetData as ServerAutohostListResponse;
        setAutohosts(response.autohosts);
      } else if (
        packetData.context === DEFAULT_CONTEXT_HEADER_CONSTANT &&
        packetData.type === DEFAULT_AUTOHOST_REMOVE_RESPONSE
      ) {
        const response = packetData as ServerAutohostRemoveResponse;

        if (response.status === 0) {
          sockets.ghostSocket.send(
            new ClientAutohostListConverter().assembly({})
          );
        } else {
          toast({
            title: t("modal.autohostList.toast.deletingError"),
            description: `${t("modal.autohostList.toast.deletingErrorReason")} ${response.status}`,
            icon: "check",
            color: "red",
          });
        }
      }
    };

    sockets.ghostSocket.addEventListener("package", onPacket);

    return () => {
      sockets.ghostSocket.removeEventListener("package", onPacket);
    };
  }, [sockets.ghostSocket]);

  return (
    <Modal closeIcon open={open} onClose={onClose}>
      <Header content={t("modal.autohostList.caption")} />
      <Modal.Content>
        {autohosts === null ? (
          <Header>{t("modal.autohostList.isLoading")}</Header>
        ) : autohosts.length === 0 ? (
          <Message info>
            <p>{t("modal.autohostList.isEmpty")}</p>
          </Message>
        ) : (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={9}>{t("modal.autohostList.table.name")}</Table.HeaderCell>
                <Table.HeaderCell width={2}>{t("modal.autohostList.table.autostart")}</Table.HeaderCell>
                <Table.HeaderCell width={2}>{t("modal.autohostList.table.gamelimit")}</Table.HeaderCell>
                <Table.HeaderCell width={5}>{t("modal.autohostList.table.gamecreated")}</Table.HeaderCell>
                <Table.HeaderCell width={3}>{t("modal.autohostList.table.owner")}</Table.HeaderCell>
                <Table.HeaderCell width={1}>{t("modal.autohostList.table.actions")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {autohosts.map((autohost) => {
                return (
                  <Table.Row key={autohost.autohostId}>
                    <Table.Cell>{autohost.name}</Table.Cell>
                    <Table.Cell>{autohost.autostart}</Table.Cell>
                    <Table.Cell>{autohost.gamesLimit}</Table.Cell>
                    <Table.Cell>{autohost.increment}</Table.Cell>
                    <Table.Cell>
                      <ConnectorId id={autohost.spaceId}></ConnectorId>
                    </Table.Cell>
                    <Table.Cell>
                      <Grid textAlign="center">
                        <Button
                          basic
                          size="small"
                          color="red"
                          icon="x"
                          onClick={() => {
                            removeAutohost(autohost.autohostId);
                          }}
                        ></Button>
                      </Grid>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </Modal.Content>
    </Modal>
  );
}

export default AutohostListModal;
