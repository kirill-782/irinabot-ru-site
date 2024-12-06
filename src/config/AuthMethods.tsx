import { SemanticCOLORS, SemanticICONS } from "semantic-ui-react";

export interface AuthMethod {
    oauthEndpoint: string;
    client_id: string;
    scope: string;

    name: string;
    icon: SemanticICONS;
    type: number;
    color: SemanticCOLORS;
    authObjectProperty: string;

    customImpl?: "telegram";
    customData?: Record<string, any>;
}

export const AviableAuthMethods: AuthMethod[] = [
    {
        oauthEndpoint: "https://discord.com/oauth2/authorize",
        client_id: "517423360091881484",
        scope: "identify",
        name: "Discord",
        icon: "discord",
        type: 1,
        color: "purple",
        authObjectProperty: "discordId",
    },
    {
        oauthEndpoint: "https://oauth.vk.com/oauth/authorize",
        client_id: "3953872",
        scope: "offline",
        name: "Вконтакте",
        icon: "vk",
        type: 2,
        color: "blue",
        authObjectProperty: "vkId",
    },
    {
        oauthEndpoint: "https://kirill-782.github.io/widget.html",
        client_id: "IrinaHost_bot",
        scope: "",
        name: "Telegram",
        icon: "telegram",
        type: 3,
        color: "blue",
        authObjectProperty: "telegramId",
        /*customImpl: "telegram",
        customData: {
            domainMap: {
                "irinabot.com": "com",
                "irinabot.ru": "ru",
                "localhost:3000": "local",
            },
        },*/
    },
    {
        oauthEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        client_id: "41535642851-thpg7oaq8d7co3420a4ptkprk317qklk.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/userinfo.profile",
        name: "Google",
        icon: "google",
        type: 4,
        color: "green",
        authObjectProperty: "googleId",
    },
    {
        oauthEndpoint: "https://oauth.yandex.ru/authorize",
        client_id: "e81a47c865764fa8b4bc35e2e467335c",
        scope: "",
        name: "Yandex",
        icon: "yandex",
        type: 5,
        color: "red",
        authObjectProperty: "yandexId",
    },
];
