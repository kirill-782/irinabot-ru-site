export const SUPPORT_LOCALES = ["ru-RU", "en-US"];


var searchParams = new URLSearchParams(window.location.search);
var paramValue = searchParams.get('locale');

export const DEFAULT_LOCALE = paramValue === "en-US" ? "en-US" : "ru-RU";

export const BROWSER_LOCALE_MAPPING = {
    "ru-RU": ["ru", "ru-RU"],
    "en-US": ["en-US"],
};
