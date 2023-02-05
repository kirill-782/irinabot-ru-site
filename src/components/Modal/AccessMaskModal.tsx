import React, { useContext, useEffect, useState } from "react";
import { Form, Modal } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";

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
    label: "modal.accessMask.checkbox.vipCommands",
  },
  {
    accessMask: AccessMaskBit.CONFIG_MANGE,
    label: "modal.accessMask.checkbox.manageConfig",
  },
  {
    accessMask: AccessMaskBit.GAME_MANGE,
    label: "modal.accessMask.checkbox.manageGame",
  },
  {
    accessMask: AccessMaskBit.PLAYERS_MANGE,
    label: "modal.accessMask.checkbox.managePlayers",
  },
  {
    accessMask: AccessMaskBit.AUTOHOST_MANGE,
    label: "modal.accessMask.checkbox.manageAutohost",
  },
  {
    accessMask: AccessMaskBit.GAME_CREATE,
    label: "modal.accessMask.checkbox.gameCreate",
  },
  {
    accessMask: AccessMaskBit.VIP_JOIN,
    label: "modal.accessMask.checkbox.vipJoin",
  },
  {
    accessMask: AccessMaskBit.GAME_POWER_UP,
    label: "modal.accessMask.checkbox.gamePowerUp",
  },
  {
    accessMask: AccessMaskBit.GAME_LIMITED_ADMINS,
    label: "modal.accessMask.checkbox.gameLimitedAdmins",
  },
  {
    accessMask: AccessMaskBit.SCOPE_SETTINGS,
    label: "modal.accessMask.checkbox.scopeSettings",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_BAN_ADD,
    label: "modal.accessMask.checkbox.adminAccessBanAdd",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_BAN_REMOVE,
    label: "modal.accessMask.checkbox.adminAccessBanRemove",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_BAN_LIST,
    label: "modal.accessMask.checkbox.adminAccessBanList",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_ADMIN_ADD,
    label: "modal.accessMask.checkbox.adminAccessAdminAdd",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_ADMIN_REMOVE,
    label: "modal.accessMask.checkbox.adminAccessAdminRemove",
  },
  {
    accessMask: AccessMaskBit.ADMIN_ACCESS_ADMIN_LIST,
    label: "modal.accessMask.checkbox.adminAccessAdminList",
  },
  {
    accessMask: AccessMaskBit.ACCESS_SHARE,
    label: "modal.accessMask.checkbox.accessShare",
  },
  {
    accessMask: AccessMaskBit.ACCESS_GLOBAL,
    label: "modal.accessMask.checkbox.accessGlobal",
  },
  {
    accessMask: AccessMaskBit.ACCESS_ROOT,
    label: "modal.accessMask.checkbox.accessRoot",
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

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

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
      <Modal.Header>{t("modal.accessMask.caption")}</Modal.Header>
      <Modal.Content>
        <Form>
          {AccessMaskCheckBoxs.map((i) => {
            return (
              <Form.Checkbox
                key={i.accessMask}
                label={t(i.label)}
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
              {t("modal.accessMask.add3in1")}
            </Form.Button>
            <Form.Button
              color="green"
              basic
              disabled={readOnly}
              onClick={() => {
                setAccessMask((accessMask) => accessMask | 3584);
              }}
            >
              {t("modal.accessMask.addBanList")}
            </Form.Button>
            <Form.Button
              color="green"
              basic
              disabled={readOnly}
              onClick={() => {
                setAccessMask((accessMask) => accessMask | 536899804);
              }}
            >
              {t("modal.accessMask.addAdminList")}
            </Form.Button>
          </Form.Group>
          {onChange && (
            <Form.Button
              color="green"
              onClick={() => {
                onChange(accessMask);
              }}
            >
              {t("modal.accessMask.Сохранить")}
            </Form.Button>
          )}
        </Form>
      </Modal.Content>
    </Modal>
  );
}

export default AccessMaskModal;
