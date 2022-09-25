import React from "react";
import { Modal } from "semantic-ui-react";
import GameListFilter, {
  GameListFilterProps,
} from "../GameList/GameListFilter";

interface GameListFiltersModalProps extends GameListFilterProps {
  open: boolean;
  onClose: () => void;
}

function GameListFiltersModal({
  open,
  onClose,
  ...filterProps
}: GameListFiltersModalProps) {
  return (
    <Modal
      closeIcon
      open={open}
      onClose={() => {
        onClose();
      }}
      size="mini"
    >
      <Modal.Header>Фильтр списка игр</Modal.Header>
      <Modal.Content>
        <GameListFilter {...filterProps} />
      </Modal.Content>
    </Modal>
  );
}

export default GameListFiltersModal;
