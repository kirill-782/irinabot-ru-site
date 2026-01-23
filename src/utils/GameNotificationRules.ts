export interface GameNotificationRule {
    id: string;
    type: "favorite_map" | "player_nickname" | "game_name_substring";
    nickname?: string;
    substring?: string;
}

export const getGameNotificationRules = (): GameNotificationRule[] => {
    const rulesStr = localStorage.getItem("game-notification-rules");
    return rulesStr ? JSON.parse(rulesStr) : [];
};

export const saveGameNotificationRules = (rules: GameNotificationRule[]) => {
    localStorage.setItem("game-notification-rules", JSON.stringify(rules));
};
