import { Button, Form, Header, Message, Modal } from "semantic-ui-react";
import { useContext, useState } from "react";
import React from "react";
import { AppRuntimeSettingsContext } from "../../context";

export interface AuthostModalData {
    gameName: string;
    autostart: number;
    countGames: number;
    hcl: string;
}

interface CreateAutohostModalProps {
    defaultGameName?: string;
    defaultAutostart?: number;
    open: boolean;
    onClose: () => void;
    onCreate: (data: AuthostModalData) => void;
}

function CreateAutohostModal({ defaultGameName, defaultAutostart, onCreate, open, onClose }: CreateAutohostModalProps) {
    const [gameName, setGameName] = useState<string>(defaultGameName || "");
    const [autostart, setAutostart] = useState<string>(defaultAutostart?.toString() || "");
    const [countGames, setCountGames] = useState<string>("10");
    const [hcl, setHcl] = useState<string>("");

    const gameNameHasError = gameName.length > 30 || gameName.length === 0;
    const autostartHasError = isNaN(parseInt(autostart));
    const countGamesHasError = isNaN(parseInt(countGames));

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    return (
        <Modal open={open} onClose={onClose} closeIcon size="tiny">
            <Header content={lang.createAutohostModalHeader} />
            <Modal.Content>
                <Message>
                    <p>{lang.createAutohostModalNotification}</p>
                </Message>
                <Form>
                    <Form.Input
                        fluid
                        error={gameNameHasError}
                        label={lang.createAutohostModalHeaderGameNameLabel}
                        placeholder={lang.createAutohostModalHeaderGameNamePlaceholder}
                        value={gameName}
                        onChange={(e, data) => {
                            setGameName(data.value);
                        }}
                    />
                    <Form.Group widths="equal">
                        <Form.Input
                            fluid
                            error={autostartHasError}
                            label={lang.createAutohostModalAutostartLabel}
                            placeholder={lang.createAutohostModalAutostartHeader}
                            pattern="[0-9]*"
                            type="number"
                            value={autostart}
                            onChange={(e, data) => {
                                setAutostart(data.value);
                            }}
                        />
                        <Form.Input
                            fluid
                            error={countGamesHasError}
                            label={lang.createAutohostModalGameLimitLabel}
                            placeholder={lang.createAutohostModalGameLimitPlaceholder}
                            pattern="[0-9]*"
                            value={countGames}
                            type="number"
                            onChange={(e, data) => {
                                setCountGames(data.value);
                            }}
                        />
                    </Form.Group>
                    <Form.Input
                        fluid
                        label={lang.createAutohostModalHclLabel}
                        placeholder={lang.createAutohostModalHclPlaceholder}
                        value={hcl}
                        onChange={(e, data) => {
                            setHcl(data.value);
                        }}
                    />
                    <Button
                        fluid
                        color="green"
                        onClick={() => {
                            onCreate({
                                gameName,
                                countGames: parseInt(countGames),
                                autostart: parseInt(autostart),
                                hcl,
                            });
                        }}
                    >
                        {lang.createAutohostModalCreate}
                    </Button>
                </Form>
            </Modal.Content>
        </Modal>
    );
}

export default CreateAutohostModal;
