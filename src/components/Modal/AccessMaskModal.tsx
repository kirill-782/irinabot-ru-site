import React, { useContext, useEffect, useState } from "react";
import { Form, Modal } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";

import "./AccessMaskModal.scss";
import LanguageKey from "../LanguageKey";
import { LanguageRepository, LanguageRepositoryKeys } from "../../localization/Lang";

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
    languageKey: LanguageRepositoryKeys;
}

const AccessMaskCheckBoxs: AccessMaskCheckbox[] = [
    {
        accessMask: AccessMaskBit.VIP_COMMANDS,
        languageKey: "accessMaskModalVip",
    },
    {
        accessMask: AccessMaskBit.CONFIG_MANGE,
        languageKey: "accessMaskModalManageConfig",
    },
    {
        accessMask: AccessMaskBit.GAME_MANGE,
        languageKey: "accessMaskModalManageGame",
    },
    {
        accessMask: AccessMaskBit.PLAYERS_MANGE,
        languageKey: "accessMaskModalManagePlayers",
    },
    {
        accessMask: AccessMaskBit.AUTOHOST_MANGE,
        languageKey: "accessMaskModalManageAutohost",
    },
    {
        accessMask: AccessMaskBit.GAME_CREATE,
        languageKey: "accessMaskModalCreateGame",
    },
    {
        accessMask: AccessMaskBit.VIP_JOIN,
        languageKey: "accessMaskModalPriorityEnter",
    },
    {
        accessMask: AccessMaskBit.GAME_POWER_UP,
        languageKey: "accessMaskModalPowerUp",
    },
    {
        accessMask: AccessMaskBit.GAME_LIMITED_ADMINS,
        languageKey: "accessMaskModalLimitedAdmins",
    },
    {
        accessMask: AccessMaskBit.SCOPE_SETTINGS,
        languageKey: "accessMaskModalScopeSettings",
    },
    {
        accessMask: AccessMaskBit.ADMIN_ACCESS_BAN_ADD,
        languageKey: "accessMaskModalBan",
    },
    {
        accessMask: AccessMaskBit.ADMIN_ACCESS_BAN_REMOVE,
        languageKey: "accessMaskModalUnban",
    },
    {
        accessMask: AccessMaskBit.ADMIN_ACCESS_BAN_LIST,
        languageKey: "accessMaskModalAddBanList",
    },
    {
        accessMask: AccessMaskBit.ADMIN_ACCESS_ADMIN_ADD,
        languageKey: "accessMaskModalAddAdmin",
    },
    {
        accessMask: AccessMaskBit.ADMIN_ACCESS_ADMIN_REMOVE,
        languageKey: "accessMaskModalRemoveAdmin",
    },
    {
        accessMask: AccessMaskBit.ADMIN_ACCESS_ADMIN_LIST,
        languageKey: "accessMaskModalViewAdmin",
    },
    {
        accessMask: AccessMaskBit.ACCESS_SHARE,
        languageKey: "accessMaskModalShare",
    },
    {
        accessMask: AccessMaskBit.ACCESS_GLOBAL,
        languageKey: "accessMaskModalGlobal",
    },
    {
        accessMask: AccessMaskBit.ACCESS_ROOT,
        languageKey: "accessMaskModalRootAdmin",
    },
];

export interface AccessMaskModalProps {
    defaultAccessMask?: number;
    onChange?: (number) => void;
    readOnly?: boolean;

    onClose?: () => void;
    open?: boolean;
}

function AccessMaskModal({ defaultAccessMask, open, onClose, onChange, readOnly }: AccessMaskModalProps) {
    const [accessMask, setAccessMask] = useState<number>(defaultAccessMask || 0);

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const t = language.getString;

    useEffect(() => {
        setAccessMask(accessMask >>> 0);
    }, [accessMask]);

    return (
        <Modal className="access-mask-modal" open={open} size="mini" onClose={onClose} closeIcon>
            <Modal.Header>
                <LanguageKey stringId={"accessMaskModalHeader"} />
            </Modal.Header>
            <Modal.Content>
                <Form>
                    {AccessMaskCheckBoxs.map((i) => {
                        return (
                            <Form.Checkbox
                                key={i.accessMask}
                                label={lang[i.languageKey]}
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
                            {lang.accessMaskModal3in1}
                        </Form.Button>
                        <Form.Button
                            color="green"
                            basic
                            disabled={readOnly}
                            onClick={() => {
                                setAccessMask((accessMask) => accessMask | 3584);
                            }}
                        >
                            {lang.accessMaskModalAddBanList}
                        </Form.Button>
                        <Form.Button
                            color="green"
                            basic
                            disabled={readOnly}
                            onClick={() => {
                                setAccessMask((accessMask) => accessMask | 536899804);
                            }}
                        >
                            {lang.accessMaskModalAddAdminList}
                        </Form.Button>
                    </Form.Group>
                    {onChange && (
                        <Form.Button
                            color="green"
                            onClick={() => {
                                onChange(accessMask);
                            }}
                        >
                            {lang.save}
                        </Form.Button>
                    )}
                </Form>
            </Modal.Content>
        </Modal>
    );
}

export default AccessMaskModal;
