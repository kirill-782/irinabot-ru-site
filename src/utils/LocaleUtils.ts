import { DEFAULT_CONFIG } from "../config/ApiConfig";
import { DEFAULT_LOCALE } from "../config/Locales";

export const importLocales = async (locale: string) => {
    let fileName = "Lang";

    if (locale) fileName = `Lang.${locale}`;

    const site = (await fetch(`${DEFAULT_CONFIG.baseURL}v1/lang?locale=${locale}`)).json();
    const timeAgo = await (() => {
        switch (locale) {
            case "en-US":
                return import(`javascript-time-ago/locale/en.json`);
                case "ru-RU":
                    return import(`javascript-time-ago/locale/ru.json`);
        }

        return import(`javascript-time-ago/locale/ru.json`);
    })();

    site.catch((e) => {
        console.error(e);
    });

    return {
        timeAgo: await timeAgo.default,
        site: await site
    };
};

export const getLocale = () => {
    return DEFAULT_LOCALE;
};
