import { DEFAULT_LOCALE } from "../config/Locales";

export const importLocales = async (locale: string) => {
    let fileName = "Lang";

    if (locale) fileName = `Lang.${locale}`;

    const site = import(`../localization/${fileName}`);
    const timeAgo = (() => {
        switch (locale) {
            case "ru":
                return import(`javascript-time-ago/locale/ru.json`);
        }
        return import(`javascript-time-ago/locale/en.json`);
    })();

    site.catch((e) => {
        console.error(e);
    });

    return {
        timeAgo: await timeAgo,
        site: await site,
    };
};

export const getLocale = () => {
    return DEFAULT_LOCALE;
};
