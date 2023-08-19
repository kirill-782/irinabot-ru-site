import React, { useContext } from "react";
import { Modal } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import GameListFilter, { GameListFilterProps } from "../GameList/GameListFilter";

interface GameListFiltersModalProps extends GameListFilterProps {
    open: boolean;
    onClose: () => void;
}

function GameListFiltersModal({ open, onClose, ...filterProps }: GameListFiltersModalProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    return (
        <Modal
            closeIcon
            open={open}
            onClose={() => {
                onClose();
            }}
            size="mini"
        >
            <Modal.Header>{lang.gameListFiltersModalHeader}</Modal.Header>
            <Modal.Content>
                <GameListFilter {...filterProps} />
            </Modal.Content>
        </Modal>
    );
}

export default GameListFiltersModal;
