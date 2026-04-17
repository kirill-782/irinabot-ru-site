import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@kokomi/react-semantic-toasts";
import { Button, Card, Container, Header, Icon, Label, Loader, Message, Segment } from "semantic-ui-react";
import { AuthContext, RestContext } from "../../context";
import { useTitle } from "../../hooks/useTitle";
import { AdminListOutWeb } from "../../models/rest/AdminList";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import {
    formatAdminListDateValue,
    isCurrentUserOwner,
    normalizeAdminListValueChangeType,
} from "../../utils/AdminListUtils";
import MetaRobots from "../Meta/MetaRobots";
import ConnectorId from "../ConnectorId";

import "./AdminListOverviewPage.scss";

const OwnerLabel: React.FC<{ owner: string | null | undefined }> = ({ owner }) => {
    const id = (owner || "").trim();

    if (!id) return <>не указан</>;

    const numeric = Number(id);

    if (!Number.isFinite(numeric) || String(numeric) !== id) {
        return <>{id}</>;
    }

    return <ConnectorId id={numeric} />;
};

const sortAdminLists = (left: AdminListOutWeb, right: AdminListOutWeb) => {
    if (!!left.default !== !!right.default) return left.default ? -1 : 1;

    if ((left.owner || "") !== (right.owner || "")) {
        return (left.owner || "").localeCompare(right.owner || "", "ru");
    }

    return (left.id || 0) - (right.id || 0);
};

function AdminListOverviewPage() {
    const navigate = useNavigate();
    const { adminListApi } = useContext(RestContext);
    const auth = useContext(AuthContext).auth;

    const [lists, setLists] = useState<AdminListOutWeb[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isCreating, setCreating] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useTitle("Admin list");

    const loadLists = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await adminListApi.getAdminLists({ signal });

                setLists(response);
            } catch (error) {
                if ((error as Error).message === "canceled") return;

                setErrorMessage(convertErrorResponseToString(error));
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [adminListApi]
    );

    useEffect(() => {
        const controller = new AbortController();

        void loadLists(controller.signal);

        return () => {
            controller.abort();
        };
    }, [loadLists]);

    const [ownLists, sharedLists] = useMemo(() => {
        const own: AdminListOutWeb[] = [];
        const shared: AdminListOutWeb[] = [];

        lists.forEach((list) => {
            if (isCurrentUserOwner(auth.currentAuth, list.owner)) {
                own.push(list);
            } else {
                shared.push(list);
            }
        });

        own.sort(sortAdminLists);
        shared.sort(sortAdminLists);

        return [own, shared];
    }, [auth.currentAuth, lists]);

    const createList = async () => {
        setCreating(true);

        try {
            const response = await adminListApi.createAdminList();

            toast({
                title: "Admin list создан",
                description: response.id ? `Открываю список #${response.id}.` : undefined,
                type: "success",
            });

            await loadLists();

            if (response.id) {
                navigate(`/admin-list/${response.id}`);
            }
        } catch (error) {
            const description = convertErrorResponseToString(error);

            toast({
                title: "Не удалось создать admin list",
                description,
                type: "error",
                time: 10000,
            });
        } finally {
            setCreating(false);
        }
    };

    const renderListCards = (title: string, items: AdminListOutWeb[], emptyMessage: string) => {
        return (
            <section className="admin-list-overview__group">
                <Header as="h2">{title}</Header>

                {items.length === 0 ? (
                    <Message info>{emptyMessage}</Message>
                ) : (
                    <Card.Group className="admin-list-overview__cards" doubling itemsPerRow={3} stackable>
                        {items.map((list) => {
                            const mode = normalizeAdminListValueChangeType(list.valueChangeType);
                            const isOwned = isCurrentUserOwner(auth.currentAuth, list.owner);

                            return (
                                <Card key={list.id || `${list.owner}-${list.comment}`}>
                                    <Card.Content>
                                        <div className="admin-list-overview__labels">
                                            <Label basic color={isOwned ? "green" : undefined}>
                                                {isOwned ? "Свой" : "Расшарен"}
                                            </Label>
                                            {mode === "SET" && (
                                                <Label basic color="violet">
                                                    {mode}
                                                </Label>
                                            )}
                                            {list.default && <Label basic color="orange">Стандартный</Label>}
                                        </div>

                                        <Card.Header>Список #{list.id || "?"}</Card.Header>
                                        <Card.Meta>Владелец: <OwnerLabel owner={list.owner} /></Card.Meta>
                                        <Card.Description>
                                            {list.comment?.trim() && <p>{list.comment.trim()}</p>}
                                            <div className="admin-list-overview__meta">
                                                <span>Список активен до: {formatAdminListDateValue(list.activeBefore)}</span>
                                                <span>
                                                    Элементы активны до: {formatAdminListDateValue(list.itemsActiveBefore)}
                                                </span>
                                            </div>
                                        </Card.Description>
                                    </Card.Content>
                                    <Card.Content extra>
                                        <Button as={Link} fluid primary size="small" to={`/admin-list/${list.id}`}>
                                            Открыть
                                        </Button>
                                    </Card.Content>
                                </Card>
                            );
                        })}
                    </Card.Group>
                )}
            </section>
        );
    };

    return (
        <Container className="extra">
            <MetaRobots noIndex />

            <div className="admin-list-overview__toolbar">
                <div>
                    <Header as="h1">Admin list</Header>
                </div>

                <div className="admin-list-overview__actions">
                    <Button
                        basic
                        icon
                        loading={isLoading}
                        onClick={() => {
                            void loadLists();
                        }}
                        title="Обновить список"
                        type="button"
                    >
                        <Icon name="refresh" />
                    </Button>
                    <Button
                        loading={isCreating}
                        onClick={() => {
                            void createList();
                        }}
                        primary
                        type="button"
                    >
                        Создать дочерний список
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <Message error>
                    <Message.Header>Не удалось загрузить admin list</Message.Header>
                    <p>{errorMessage}</p>
                </Message>
            )}

            {isLoading ? (
                <Segment className="admin-list-overview__loader">
                    <Loader active inline="centered" />
                </Segment>
            ) : (
                <>
                    {renderListCards("Собственные списки", ownLists, "У текущего пользователя пока нет собственных списков.")}
                    {renderListCards("Общие списки", sharedLists, "Нет списков, которыми поделились другие пользователи.")}
                </>
            )}
        </Container>
    );
}

export default AdminListOverviewPage;
