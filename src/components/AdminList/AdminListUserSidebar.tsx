import React, { useContext, useEffect, useState } from "react";
import { Button, Form, Header, Icon, Loader, Menu, Message, Search, SearchResultProps, Segment } from "semantic-ui-react";
import { AdminListUserListOutWeb } from "../../models/rest/AdminList";
import { UserNicknameSearchOutWeb } from "../../models/rest/UserNickname";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { useDebounce } from "../../hooks/useDebounce";
import { EVERYONE_TARGET } from "../../utils/AdminListUtils";
import WarcraftIIIText from "../WarcraftIIIText";
import UserIdLabel from "./UserIdLabel";

interface AdminListUserSidebarProps {
    users: AdminListUserListOutWeb[];
    selectedUserId: string;
    isLoading: boolean;
    errorMessage: string;
    everyoneAvailable?: boolean;
    onOpenUser: (userId: string) => void;
}

// результат для semantic Search; title — техническое поле (ключ/значение), отображение через resultRenderer
interface NicknameResultData extends UserNicknameSearchOutWeb {
    title: string;
}

// чисто числовой ввод трактуем как userId, всё остальное — префикс ника
const isUserIdInput = (value: string) => /^\d+$/.test(value);

const renderNicknameResult = (result: SearchResultProps) => {
    const { displayName, username, userId } = result as NicknameResultData;
    const name = (displayName || "").trim() || (username || "").trim();

    return (
        <div className="nickname-result">
            <span className="nickname-result__name">
                {name ? (
                    <WarcraftIIIText ignoreTags={["|n"]}>{name}</WarcraftIIIText>
                ) : (
                    `#${userId}`
                )}
            </span>
            <span className="nickname-result__id">#{userId}</span>
        </div>
    );
};

const AdminListUserSidebar: React.FC<AdminListUserSidebarProps> = ({
    users,
    selectedUserId,
    isLoading,
    errorMessage,
    everyoneAvailable,
    onOpenUser,
}) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const { userNicknameApi } = useContext(RestContext);
    const t = language.getString;

    const [lookupValue, setLookupValue] = useState(selectedUserId);
    const [results, setResults] = useState<NicknameResultData[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // debounce ввода: запрос поиска уходит только после паузы в наборе (как в BanlistStatsTab)
    const debouncedValue = useDebounce(lookupValue, 350);

    useEffect(() => {
        // маркер «все пользователи» в поле поиска не показываем
        setLookupValue(selectedUserId === EVERYONE_TARGET ? "" : selectedUserId);
    }, [selectedUserId]);

    // поиск ника по префиксу; числовой/пустой ввод ника не ищет — это userId
    useEffect(() => {
        const query = debouncedValue.trim();

        if (!query || isUserIdInput(query)) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        const controller = new AbortController();

        setIsSearching(true);

        userNicknameApi
            .searchNicknames(query, 20, { signal: controller.signal })
            .then((found) => {
                setResults(found.map((user) => ({ ...user, title: user.userId })));
            })
            .catch((error) => {
                if ((error as Error).message === "canceled") return;

                setResults([]);
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsSearching(false);
            });

        return () => {
            controller.abort();
        };
    }, [debouncedValue, userNicknameApi]);

    const trimmedValue = lookupValue.trim();
    const isNicknameQuery = trimmedValue.length > 0 && !isUserIdInput(trimmedValue);
    // ввод изменился, но debounce ещё не «догнал» — показываем загрузку, а не «не найдено»
    const pendingSearch = isNicknameQuery && trimmedValue !== debouncedValue.trim();
    const searchLoading = isSearching || pendingSearch;

    const submitLookup = (event: React.FormEvent) => {
        event.preventDefault();

        const normalized = lookupValue.trim();

        if (!normalized) return;

        // userId — открываем напрямую; ник с единственным совпадением — открываем его
        if (isUserIdInput(normalized)) {
            onOpenUser(normalized);
        } else if (results.length === 1) {
            onOpenUser(results[0].userId);
        }
    };

    const handleResultSelect = (result: NicknameResultData) => {
        setResults([]);
        onOpenUser(result.userId);
    };

    return (
        <Segment>
            <Header as="h3">{t("adminListSidebarTitle")}</Header>

            <Form onSubmit={submitLookup}>
                <div className="user-open-form">
                    <Search
                        className="user-open-search"
                        input={{ fluid: true }}
                        loading={searchLoading}
                        minCharacters={1}
                        noResultsMessage={t("adminListSidebarSearchNoResults")}
                        onResultSelect={(_, data) =>
                            handleResultSelect(data.result as NicknameResultData)
                        }
                        onSearchChange={(_, data) => setLookupValue(data.value || "")}
                        placeholder={t("adminListSidebarSearchPlaceholder")}
                        resultRenderer={renderNicknameResult}
                        results={results}
                        showNoResults={isNicknameQuery && !searchLoading}
                        value={lookupValue}
                    />
                    <Button primary type="submit">
                        {t("adminListSidebarOpen")}
                    </Button>
                </div>
            </Form>

            <p className="user-open-hint">{t("adminListSidebarSearchHint")}</p>

            {errorMessage && (
                <Message error size="small">
                    <p>{errorMessage}</p>
                </Message>
            )}

            {isLoading ? (
                <Loader active inline="centered" />
            ) : !everyoneAvailable && users.length === 0 ? (
                <Message info>{t("adminListSidebarEmpty")}</Message>
            ) : (
                <Menu className="user-menu" fluid secondary vertical>
                    {everyoneAvailable && (
                        <Menu.Item
                            active={selectedUserId === EVERYONE_TARGET}
                            onClick={() => onOpenUser(EVERYONE_TARGET)}
                        >
                            <div className="user-item">
                                <strong>
                                    <Icon name="users" />
                                    {t("adminListSidebarEveryone")}
                                </strong>
                                <span>{t("adminListSidebarEveryoneHint")}</span>
                            </div>
                        </Menu.Item>
                    )}
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
