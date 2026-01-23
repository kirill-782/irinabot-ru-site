import React, { useEffect, useState, useContext } from "react";
import { Button, Modal, Form, Dropdown, Input, List, Icon } from "semantic-ui-react";
import {
    GameNotificationRule,
    getGameNotificationRules,
    saveGameNotificationRules,
} from "../../utils/GameNotificationRules";
import { AppRuntimeSettingsContext } from "../../context";

interface GameNotificationSettingsModalProps {
    open: boolean;
    onClose: () => void;
}

const GameNotificationSettingsModal: React.FC<GameNotificationSettingsModalProps> = ({ open, onClose }) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const [rules, setRules] = useState<GameNotificationRule[]>([]);
    const [newRuleType, setNewRuleType] = useState<GameNotificationRule["type"]>("favorite_map");
    const [newNickname, setNewNickname] = useState("");
    const [newSubstring, setNewSubstring] = useState("");

    useEffect(() => {
        if (open) {
            setRules(getGameNotificationRules());
        }
    }, [open]);

    const addRule = () => {
        const newRule: GameNotificationRule = {
            id: Date.now().toString(),
            type: newRuleType,
            ...(newRuleType === "player_nickname" && { nickname: newNickname }),
            ...(newRuleType === "game_name_substring" && { substring: newSubstring }),
        };
        const updatedRules = [...rules, newRule];
        setRules(updatedRules);
        saveGameNotificationRules(updatedRules);
        setNewNickname("");
        setNewSubstring("");
    };

    const removeRule = (id: string) => {
        const updatedRules = rules.filter((r) => r.id !== id);
        setRules(updatedRules);
        saveGameNotificationRules(updatedRules);
    };

    const ruleTypeOptions = [
        { key: "favorite_map", text: lang.gameNotificationSettingsModalRuleTypeFavoriteMap, value: "favorite_map" },
        {
            key: "player_nickname",
            text: lang.gameNotificationSettingsModalRuleTypePlayerNickname,
            value: "player_nickname",
        },
        {
            key: "game_name_substring",
            text: lang.gameNotificationSettingsModalRuleTypeGameNameSubstring,
            value: "game_name_substring",
        },
    ];

    return (
        <Modal open={open} onClose={onClose}>
            <Modal.Header>{lang.gameNotificationSettingsModalHeader}</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <label>{lang.gameNotificationSettingsModalRuleTypeLabel}</label>
                        <Dropdown
                            placeholder={lang.gameNotificationSettingsModalRuleTypePlaceholder}
                            fluid
                            selection
                            options={ruleTypeOptions}
                            value={newRuleType}
                            onChange={(e, { value }) => setNewRuleType(value as GameNotificationRule["type"])}
                        />
                    </Form.Field>
                    {newRuleType === "player_nickname" && (
                        <Form.Field>
                            <label>{lang.gameNotificationSettingsModalPlayerNicknameLabel}</label>
                            <Input
                                placeholder={lang.gameNotificationSettingsModalPlayerNicknamePlaceholder}
                                value={newNickname}
                                onChange={(e) => setNewNickname(e.target.value)}
                            />
                        </Form.Field>
                    )}
                    {newRuleType === "game_name_substring" && (
                        <Form.Field>
                            <label>{lang.gameNotificationSettingsModalGameNameSubstringLabel}</label>
                            <Input
                                placeholder={lang.gameNotificationSettingsModalGameNameSubstringPlaceholder}
                                value={newSubstring}
                                onChange={(e) => setNewSubstring(e.target.value)}
                            />
                        </Form.Field>
                    )}
                    <Button type="button" primary onClick={addRule}>
                        {lang.gameNotificationSettingsModalAddRule}
                    </Button>
                </Form>
                <List divided relaxed>
                    {rules.map((rule) => (
                        <List.Item key={rule.id}>
                            <List.Content floated="right">
                                <Button icon onClick={() => removeRule(rule.id)}>
                                    <Icon name="trash" />
                                </Button>
                            </List.Content>
                            <List.Content>
                                {rule.type === "favorite_map" && lang.gameNotificationSettingsModalRuleTypeFavoriteMap}
                                {rule.type === "player_nickname" &&
                                    `${lang.gameNotificationSettingsModalRuleTypePlayerNickname}: ${rule.nickname}`}
                                {rule.type === "game_name_substring" &&
                                    `${lang.gameNotificationSettingsModalRuleTypeGameNameSubstring}: ${rule.substring}`}
                            </List.Content>
                        </List.Item>
                    ))}
                </List>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>{lang.close}</Button>
            </Modal.Actions>
        </Modal>
    );
};

export default GameNotificationSettingsModal;
