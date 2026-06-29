import React, { useContext } from "react";
import { Button, Checkbox, Form, Modal } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { UseBanlistEntryColumnsResult } from "../../hooks/useBanlistEntryColumns";
import { BANLIST_ENTRY_COLUMNS } from "../../utils/BanlistEntryColumns";

interface BanlistColumnsModalProps {
    open: boolean;
    onClose: () => void;
    columns: UseBanlistEntryColumnsResult;
}

// Модалка выбора отображаемых колонок таблицы записей. Состояние и его
// сохранение в localStorage живут в useBanlistEntryColumns — здесь только UI.
function BanlistColumnsModal({ open, onClose, columns }: BanlistColumnsModalProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    return (
        <Modal onClose={onClose} open={open} size="mini">
            <Modal.Header>{t("banlistColumnsModalHeader")}</Modal.Header>
            <Modal.Content>
                <p>{t("banlistColumnsModalDescription")}</p>
                <Form>
                    {BANLIST_ENTRY_COLUMNS.map((column) => (
                        <Form.Field key={column.key}>
                            <Checkbox
                                checked={columns.isVisible(column.key)}
                                label={t(column.labelKey)}
                                onChange={() => columns.toggleColumn(column.key)}
                            />
                        </Form.Field>
                    ))}
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    basic
                    disabled={columns.hiddenColumns.size === 0}
                    onClick={columns.showAll}
                >
                    {t("banlistColumnsModalShowAll")}
                </Button>
                <Button primary onClick={onClose}>
                    {t("close")}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default BanlistColumnsModal;
