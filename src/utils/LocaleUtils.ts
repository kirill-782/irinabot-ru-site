import { DEFAULT_LOCALE } from "../config/Locales";

export const importLocales = async (locale: string) => {
  const site = import(`../translations/${locale}.json`);
  const timeAgo = (() => {
    switch (locale) {
      case "ru":
        return import(`javascript-time-ago/locale/ru.json`);
    }
    return import(`javascript-time-ago/locale/en.json`);
  })();

  return {
    timeAgo: await timeAgo,
    site: await site,
  };
};

export const getLocale = () => {
  return DEFAULT_LOCALE;
};
