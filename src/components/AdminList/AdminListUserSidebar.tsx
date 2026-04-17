import React, { useContext, useEffect, useState } from "react";
import { Button, Form, Header, Loader, Menu, Message, Segment } from "semantic-ui-react";
import { AdminListUserListOutWeb } from "../../models/rest/AdminList";
import { AppRuntimeSettingsContext } from "../../context";
import UserIdLabel from "./UserIdLabel";

interface AdminListUserSidebarProps {
    users: AdminListUserListOutWeb[];
    selectedUserId: string;
    isLoading: boolean;
    errorMessage: string;
    onOpenUser: (userId: string) => void;
}

const AdminListUserSidebar: React.FC<AdminListUserSidebarProps> = ({
    users,
    selectedUserId,
    isLoading,
    errorMessage,
    onOpenUser,
}) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [lookupValue, setLookupValue] = useState(selectedUserId);

    useEffect(() => {
        setLookupValue(selectedUserId);
    }, [selectedUserId]);

    const submitLookup = (event: React.FormEvent) => {
        event.preventDefault();

        const normalized = lookupValue.trim();

        if (!normalized) return;

        onOpenUser(normalized);
    };

    return (
        <Segment>
            <Header as="h3">{t("adminListSidebarTitle")}</Header>

            <Form onSubmit={submitLookup}>
                <div className="user-open-form">
                    <Form.Input
                        fluid
                        onChange={(_, data) => {
                            setLookupValue((data.value as string) || "");
                        }}
                        placeholder={t("adminListSidebarSearchPlaceholder")}
                        type="number"
                        value={lookupValue}
                    />
                    <Button primary type="submit">
                        {t("adminListSidebarOpen")}
                    </Button>
                </div>
            </Form>

            {errorMessage && (
                <Message error size="small">
                    <p>{errorMessage}</p>
                </Message>
            )}

            {isLoading ? (
                <Loader active inline="centered" />
            ) : users.length === 0 ? (
                <Message info>{t("adminListSidebarEmpty")}</Message>
            ) : (
                <Menu className="user-menu" fluid secondary vertical>
                    {users.map((user) => {
                        const userId = user.userId || "";

                        return (
                            <Menu.Item
                                active={userId === selectedUserId}
                                key={userId}
                                onClick={() => onOpenUser(userId)}
                            >
                                <div className="user-item">
                                    <strong>
                                        <UserIdLabel userId={userId} />
                                    </strong>
                                    <span>{t("adminListSidebarDeclarationCount", { count: String(user.declarationCount || 0) })}</span>
                                </div>
                            </Menu.Item>
                        );
                    })}
                </Menu>
            )}
        </Segment>
    );
};

export default AdminListUserSidebar;
