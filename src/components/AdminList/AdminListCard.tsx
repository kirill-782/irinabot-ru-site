import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button, Header, Label } from "semantic-ui-react";
import { AdminListOutWeb } from "../../models/rest/AdminList";
import {
    formatAdminListDateValue,
    normalizeAdminListValueChangeType,
} from "../../utils/AdminListUtils";
import { AppRuntimeSettingsContext } from "../../context";
import UserIdLabel from "./UserIdLabel";

interface AdminListCardProps {
    list: AdminListOutWeb;
    listId?: number;
    showBackLink?: boolean;
    toolbar?: React.ReactNode;
}

const AdminListCard: React.FC<AdminListCardProps> = ({ list, listId, showBackLink, toolbar }) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const mode = normalizeAdminListValueChangeType(list.valueChangeType);
    const privilegeLevel = typeof list.privilegeLevel === "number" ? list.privilegeLevel : null;
    const displayId = list.id || listId;
    const trimmedComment = list.comment?.trim() || "";

    return (
        <>
            <div className="toolbar">
                <div>
                    {showBackLink && (
                        <Button as={Link} basic size="small" to="/admin-list">
                            {t("adminListBackToLists")}
                        </Button>
                    )}
                    <Header as="h1">Admin list #{displayId ?? "?"}</Header>
                    <Label.Group>
                        {list.default && (
                            <Label basic color="orange">
                                {t("adminListLabelDefault")}
                            </Label>
                        )}
                        <Label basic color={mode === "SET" ? "violet" : "blue"}>
                            {mode}
                        </Label>
                        <Label basic color={privilegeLevel !== null ? "teal" : "grey"}>
                            {t("adminListLabelStrength", { level: privilegeLevel !== null ? String(privilegeLevel) : t("adminListLabelNoAccess") })}
                        </Label>
                        <Label basic>
                            {t("adminListLabelOwner")}: {list.owner ? <UserIdLabel userId={list.owner} /> : t("adminListLabelOwnerNone")}
                        </Label>
                        {list.activeBefore && (
                            <Label basic color="yellow">
                                {t("adminListLabelListExpiry", { date: formatAdminListDateValue(list.activeBefore) })}
                            </Label>
                        )}
                        {list.itemsActiveBefore && (
                            <Label basic color="yellow">
                                {t("adminListLabelItemsExpiry", { date: formatAdminListDateValue(list.itemsActiveBefore) })}
                            </Label>
                        )}
                    </Label.Group>
                    {trimmedComment && <p>{trimmedComment}</p>}
                </div>

                {toolbar && <div className="toolbar-actions">{toolbar}</div>}
            </div>
        </>
    );
};

export default AdminListCard;
