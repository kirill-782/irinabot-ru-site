import React, { useEffect, useState } from "react";
import { Form, Modal } from "semantic-ui-react";

import "./AccessMaskModal.scss";

export enum AccessMaskBit {
  VIP_COMMANDS = 1,
  CONFIG_MANGE = 2,
  GAME_MANGE = 8,
  PLAYERS_MANGE = 16,
  AUTOHOST_MANGE = 32,
  GAME_CREATE = 64,
  VIP_JOIN = 128,
  GAME_POWER_UP = 256,
  GAME_LIMITED_ADMINS = 268435456,
  SCOPE_SETTINGS = 32768,
  ADMIN_ACCESS_BAN_ADD = 512,
  ADMIN_ACCESS_BAN_REMOVE = 1024,
  ADMIN_ACCESS_BAN_LIST = 2048,
  ADMIN_ACCESS_ADMIN_ADD = 4096,
  ADMIN_ACCESS_ADMIN_REMOVE = 8192,
  ADMIN_ACCESS_ADMIN_LIST = 16384,
  ACCESS_SHARE = 1 << 29,
  ACCESS_GLOBAL = 1 << 30,
  ACCESS_ROOT = 1 << 31,
}

interface AccessMaskCheckbox {
  accessMask: number;
  label: string;
}

const AccessMaskCheckBoxs: AccessMaskCheckbox[] = [
  {
    accessMask: AccessMaskBit.VIP_COMMANDS,
    label: "Доступ к VIP командам",
  },
  {
    accessMask: AccessMaskBit.CONFIG_MANGE,
    label: "Управлять конфигом",
  },
  {
    accessMask: AccessMaskBit.GAME_MANGE,
    label: "Управлять игрой",
  },
  {
    accessMask: AccessMaskBit.PLAYERS_MANGE,
    label: "Упровлять игроками",
  },
  {
    accessMask: AccessMaskBit.AUTOHOST_MANGE,
    label: "Управлять автохостом",
  },
  {
    accessMask: AccessMaskBit.GAME_CREATE,
    label: "Создавать игры",
  },
  {
    accessMask: AccessMaskBit.VIP_JOIN,
    label: "Приоритетный вход",
  },
  {
    accessMask: AccessMaskBit.GAME_POWER_UP,
    label: "GAME_POWER_UP",
  },
  {
    accessMask: AccessMaskBit.GAME_LIMITED_ADMINS,
    label: "GAME_LIMITED_ADMINS",
  },
  {
    accessMask: AccessMaskBit.SCOPE_SETTINGS,
    label: "SCOPE_SETTINGS",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_BAN_ADD,
    label: "Банить",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_BAN_REMOVE,
    label: "Снимать баны",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_BAN_LIST,
    label: "Просматривать баны",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_ADMIN_ADD,
    label: "Назначать администраторов",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_ADMIN_REMOVE,
    label: "Разжаловать администраторов",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_ADMIN_LIST,
    label: "Просматривать список администраторов",
  },
  {
    accessMask: AccessMaskBit.ACCESS_SHARE,
    label: "Разделение прав на связанные аккаунты",
  },
  {
    accessMask: AccessMaskBit.ACCESS_GLOBAL,
    label: "Глобальный доступ",
  },
  {
    accessMask: AccessMaskBit.ACCESS_ROOT,
    label: "Первородный",
  },
];

export interface AccessMaskModalProps {
  defaultAccessMask?: number;
  onChange?: (number) => void;
  readOnly?: boolean;

  onClose?: () => void;
  open?: boolean;
}

function AccessMaskModal({
  defaultAccessMask,
  open,
  onClose,
  onChange,
  readOnly,
}: AccessMaskModalProps) {
  const [accessMask, setAccessMask] = useState<number>(defaultAccessMask || 0);

  useEffect(() => {
    setAccessMask(accessMask >>> 0);
  }, [accessMask]);

  return (
    <Modal
      className="access-mask-modal"
      open={open}
      size="mini"
      onClose={onClose}
      closeIcon
    >
      <Modal.Header>Редактор админ прав</Modal.Header>
      <Modal.Content>
        <Form>
          {AccessMaskCheckBoxs.map((i) => {
            return (
              <Form.Checkbox
                key={i.accessMask}
                label={i.label}
                disabled={readOnly}
                checked={(accessMask & i.accessMask) === i.accessMask}
                onChange={(_, data) => {
                  if (!data.checked) {
                    setAccessMask((accessMask) => accessMask & ~i.accessMask);
                  } else {
                    setAccessMask((accessMask) => accessMask | i.accessMask);
                  }
                }}
              ></Form.Checkbox>
            );
          })}
          <Form.Input
            type="number"
            label="AccessMask"
            disabled={readOnly}
            value={accessMask}
            onChange={(_, data) => {
              setAccessMask(parseInt(data.value));
            }}
          ></Form.Input>
          <Form.Group>
            <Form.Button
              color="green"
              basic
              disabled={readOnly}
              onClick={() => {
                setAccessMask((accessMask) => accessMask | 3841);
              }}
            >
              Добавить 3 в 1
            </Form.Button>
            <Form.Button
              color="green"
              basic
              disabled={readOnly}
              onClick={() => {
                setAccessMask((accessMask) => accessMask | 3584);
              }}
            >
              Добавить BanList
            </Form.Button>
            <Form.Button
              color="green"
              basic
              disabled={readOnly}
              onClick={() => {
                setAccessMask((accessMask) => accessMask | 536899804);
              }}
            >
              Добавить AdminList
            </Form.Button>
          </Form.Group>
          {onChange && (
            <Form.Button
              color="green"
              onClick={() => {
                onChange(accessMask);
              }}
            >
              Сохранить
            </Form.Button>
          )}
        </Form>
      </Modal.Content>
    </Modal>
  );
}

export default AccessMaskModal;
