import React, { useContext, useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Container, Grid, Header, Menu, Message, Segment } from "semantic-ui-react";
import MetaRobots from "../Meta/MetaRobots";
import { useTitle } from "../../hooks/useTitle";
import { AuthContext } from "../../context";
import { getAccessibleAdminSections } from "./AdminSections";

import "./AdminPage.scss";

function AdminPage() {
    const auth = useContext(AuthContext).auth;
    const accessibleSections = useMemo(() => {
        return getAccessibleAdminSections(auth);
    }, [auth]);

    useTitle("Админ панель");

    if (accessibleSections.length === 0) {
        return (
            <Container className="admin-page">
                <MetaRobots noIndex />
                <Message info>
                    <Message.Header>Нет доступных разделов</Message.Header>
                    <p>Для этой административной панели у текущего пользователя нет доступных подстраниц.</p>
                </Message>
            </Container>
        );
    }

    return (
        <Container className="admin-page">
            <MetaRobots noIndex />
            <Grid stackable>
                <Grid.Column width={3}>
                    <Menu className="admin-page__menu" fluid secondary vertical>
                        <Menu.Item>
                            <Header as="h4">Администрирование</Header>
                        </Menu.Item>
                        {accessibleSections.map((section) => {
                            return (
                                <Menu.Item as={NavLink} key={section.key} to={`/admin/${section.path}`}>
                                    {section.title}
                                </Menu.Item>
                            );
                        })}
                    </Menu>
                </Grid.Column>
                <Grid.Column width={13}>
                    <Segment className="admin-page__content">
                        <Outlet />
                    </Segment>
                </Grid.Column>
            </Grid>
        </Container>
    );
}

export default AdminPage;
