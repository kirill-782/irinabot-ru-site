import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    Container,
    Header,
    Icon,
    Input,
    Label,
    Loader,
    Message,
    Segment,
} from "semantic-ui-react";
import { AppRuntimeSettingsContext, AuthContext } from "../../context";
import { useBanlists } from "../../hooks/useBanlists";
import { useResolveConnectorIds } from "../../hooks/useResolveConnectorIds";
import { useTitle } from "../../hooks/useTitle";
import { BanlistOutWeb } from "../../models/rest/Banlist";
import { formatRelative } from "../../utils/BanlistUtils";
import {
    banlistAccessLevelLabel,
    resolveBanlistCapabilities,
} from "../../utils/BanlistPermissions";
import UserIdLabel from "../AdminList/UserIdLabel";
import BanlistFormModal from "../Banlist/BanlistFormModal";
import MetaRobots from "../Meta/MetaRobots";

import "./BanlistOverviewPage.scss";

function BanlistOverviewPage() {
    const navigate = useNavigate();
    const { language } = useContext(AppRuntimeSettingsContext);
    const { auth } = useContext(AuthContext);
    const t = language.getString;

    const { banlists, isLoading, errorMessage, reload } = useBanlists();

    const [search, setSearch] = useState("");
    const [isNewOpen, setNewOpen] = useState(false);

    useTitle(t("banlistOverviewTitle"));

    useResolveConnectorIds(
        useMemo(() => banlists.map((banlist) => banlist.ownerUserId), [banlists])
    );

    const filtered = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();

        const sorted = [...banlists].sort((left, right) => {
            const leftUpd = left.updatedAt || left.createdAt || 0;
            const rightUpd = right.updatedAt || right.createdAt || 0;
            return rightUpd - leftUpd;
        });

        if (!query) return sorted;

        return sorted.filter((banlist) => {
            const name = (banlist.name || "").toLocaleLowerCase();
            const description = (banlist.description || "").toLocaleLowerCase();
            return name.includes(query) || description.includes(query);
        });
    }, [banlists, search]);

    const handleCreated = async (created: BanlistOutWeb) => {
        await reload();

        if (created.id !== undefined) {
            navigate(`/banlist/${created.id}`);
        }
    };

    const renderCard = (banlist: BanlistOutWeb) => {
        const description = (banlist.description || "").trim();
        const capabilities = resolveBanlistCapabilities(banlist, auth.currentAuth);
        // нет базового права view — банлист недоступен для открытия
        const hasAccess = capabilities.canView;

        return (
            <Card className={hasAccess ? undefined : "locked"} key={banlist.id}>
                <Card.Content>
                    <Card.Header className="card-title" title={banlist.name || undefined}>
                        {banlist.name || t("banlistCardFallbackName", { id: banlist.id })}
                    </Card.Header>
                    <Card.Meta>
                        {t("banlistUpdatedAt", {
                            value: formatRelative(t, banlist.updatedAt || banlist.createdAt),
                        })}
                    </Card.Meta>
                    <Card.Description className="card-description">
                        {description ? description : <i>{t("banlistNoDescription")}</i>}
                    </Card.Description>
                    {!hasAccess ? (
                        <div className="card-access">
                            <Label basic size="tiny">
                                <Icon name="lock" />
                                {t("banlistAccessNone")}
                            </Label>
                        </div>
                    ) : (
                        !capabilities.canManageBanlist && (
                            <div className="card-access">
                                <Label basic size="tiny">
                                    {banlistAccessLevelLabel(t, capabilities)}
                                </Label>
                            </div>
                        )
                    )}
                </Card.Content>
                <Card.Content extra>
                    <div className="card-footer">
                        {banlist.ownerUserId ? (
                            <Label basic size="tiny">
                                <Icon name="user" />
                                <UserIdLabel userId={banlist.ownerUserId} />
                            </Label>
                        ) : (
                            <span />
                        )}
                        {hasAccess ? (
                            <Button
                                as={Link}
                                compact
                                primary
                                size="small"
                                to={`/banlist/${banlist.id}`}
                            >
                                {t("banlistOverviewOpen")}
                                <Icon name="arrow right" />
                            </Button>
                        ) : (
                            <Button
                                compact
                                disabled
                                icon
                                size="small"
                                title={t("banlistAccessNone")}
                            >
                                <Icon name="lock" />
                            </Button>
                        )}
                    </div>
                </Card.Content>
            </Card>
        );
    };

    return (
        <Container className="banlist-overview extra">
            <MetaRobots noIndex />

            <div className="toolbar">
                <div>
                    <Header as="h1">
                        {t("banlistOverviewHeader")}
                        <Header.Subheader>
                            {banlists.length}{" "}
                            {banlists.length === 1
                                ? t("banlistOverviewCountOne")
                                : t("banlistOverviewCountMany")}
                        </Header.Subheader>
                    </Header>
                </div>

                <div className="actions">
                    <Input
                        className="search-input"
                        icon="search"
                        iconPosition="left"
                        onChange={(_, data) => setSearch(data.value)}
                        placeholder={t("banlistOverviewSearchPlaceholder")}
                        value={search}
                    />
                    <Button
                        basic
                        icon
                        loading={isLoading}
                        onClick={() => void reload()}
                        title={t("banlistRefresh")}
                        type="button"
                    >
                        <Icon name="refresh" />
                    </Button>
                    <Button onClick={() => setNewOpen(true)} primary type="button">
                        <Icon name="plus" />
                        {t("banlistNewBanlist")}
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <Message error>
                    <Message.Header>{t("banlistOverviewLoadFailed")}</Message.Header>
                    <p>{errorMessage}</p>
                </Message>
            )}

            {isLoading ? (
                <Segment>
                    <Loader active inline="centered" />
                </Segment>
            ) : filtered.length === 0 && !search ? (
                <Card.Group className="card-grid" doubling itemsPerRow={3} stackable>
                    <Card
                        className="empty-card"
                        onClick={() => setNewOpen(true)}
                    >
                        <Card.Content textAlign="center">
                            <div className="empty-card-inner">
                                <Icon name="plus" size="huge" />
                                <Header as="h4" sub>
                                    {t("banlistOverviewCreateFirst")}
                                </Header>
                            </div>
                        </Card.Content>
                    </Card>
                </Card.Group>
            ) : filtered.length === 0 ? (
                <Message info>{t("banlistOverviewNothingFound", { search })}</Message>
            ) : (
                <Card.Group className="card-grid" doubling itemsPerRow={3} stackable>
                    {filtered.map(renderCard)}
                    <Card
                        className="empty-card"
                        onClick={() => setNewOpen(true)}
                    >
                        <Card.Content textAlign="center">
                            <div className="empty-card-inner">
                                <Icon name="plus" size="huge" />
                                <Header as="h4" sub>
                                    {t("banlistNewBanlist")}
                                </Header>
                            </div>
                        </Card.Content>
                    </Card>
                </Card.Group>
            )}

            <BanlistFormModal
                onClose={() => setNewOpen(false)}
                onSuccess={handleCreated}
                open={isNewOpen}
            />
        </Container>
    );
}

export default BanlistOverviewPage;
