// Ответ поиска игроков по нику: /v1/nicknames/search
export interface UserNicknameSearchOutWeb {
    userId: string;
    // Отображаемое имя (может содержать WC3-теги цвета)
    displayName?: string | null;
    // Имя пользователя
    username?: string | null;
}
