import React, { useContext, useState } from "react";
import { Message, Modal, Table } from "semantic-ui-react";
import ConnectorId from "../ConnectorId";
import { AuthContext } from "./../../context/index";
import AccessMaskModal from "./AccessMaskModal";

import "./AccessListModal.scss";

export interface AccessListModalProps {
  open?: boolean;
  onClose?: () => void;
}

function AccessListModal({ open, onClose }: AccessListModalProps) {
  const auth = useContext(AuthContext).auth;
  const accessRows = auth.accessMask.getRecords();

  const [showAccessMask, setShowAccessMask] = useState<number | undefined>(
    undefined
  );

  return (
    <Modal open={open} onClose={onClose} closeIcon>
      <Modal.Header>Список прав</Modal.Header>
      <Modal.Content>
        {showAccessMask !== undefined && (
          <AccessMaskModal
            open
            onClose={() => {
              setShowAccessMask(undefined);
            }}
            defaultAccessMask={showAccessMask}
            readOnly
          />
        )}
        {accessRows.length === 0 ? (
          <Message info>У вас нет прав. Прощайте</Message>
        ) : (
          <>
            <Message info>
              Не пугайся, бро. Отображается дата истечения ближайшего доната.
              Как только он истечет - дата обновится.
            </Message>
            <Table>
              <Table.Header>
                <Table.HeaderCell>ID игрока</Table.HeaderCell>
                <Table.HeaderCell>Маска прав</Table.HeaderCell>
                <Table.HeaderCell>Истекают</Table.HeaderCell>
              </Table.Header>
              {accessRows.map((i) => {
                return (
                  <Table.Row key={i.spaceId}>
                    <Table.Cell>
                      <ConnectorId id={i.spaceId} />
                    </Table.Cell>
                    <Table.Cell
                      onClick={() => {
                        setShowAccessMask(i.accessMask);
                      }}
                    >
                      <span className="access-list-modal access-mask">
                        {i.accessMask}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {i.expireTime === 0
                        ? "Бессрочно"
                        : new Date(i.expireTime * 1000).toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table>
          </>
        )}
      </Modal.Content>
    </Modal>
  );
}

export default AccessListModal;
