import TimeAgo from "javascript-time-ago";
import TimeAgoRuLocale from "javascript-time-ago/locale/ru.json";

import { useCallback, useState } from "react";
import { importLocales } from "../utils/LocaleUtils";
import { LanguageRepositoryKeys, LanguageRepository, LanguageData } from "../localization/Lang";

TimeAgo.addDefaultLocale(TimeAgoRuLocale);

type stringMap = {
    [key: string]: string | boolean | number | null | undefined;
};

export type GetLanguageStaring = (id: LanguageRepositoryKeys, options?: stringMap, language?: string) => string;

type UseLanguageResult = [
    (language: string) => void,
    (language: string, data: any) => void,
    GetLanguageStaring,
    string,
    LanguageRepository
];

export const useLanguage = (): UseLanguageResult => {
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [data, setData] = useState<any>({});

    const getString = useCallback(
        (id: string, options?: stringMap, language?: string): string => {
            const currentLanguage = language || selectedLanguage;

            let result = data[currentLanguage]?.[id] || LanguageData[id];

            if (options && result) {
                Object.entries(options).forEach((i) => {
                    result = result.replaceAll(`{${i[0]}}`, i[1]);
                });
            }

            return result;
        },
        [data, selectedLanguage]
    );

    const pushLanguageData = (language: string, updateData: any | null) => {
        setData((data) => {
            if (!updateData) {
                delete data[language];
                return { ...data };
            }

            return { ...data, [language]: { ...LanguageData, ...updateData } };
        });
    };

    const loadLanguage = useCallback(async (locale: string) => {
        const result = await importLocales(locale);

        TimeAgo.addLocale(result.timeAgo);
        TimeAgo.setDefaultLocale(locale);

        pushLanguageData(locale, result.site);

        setSelectedLanguage(locale);

        return true;
    }, []);

    return [loadLanguage, pushLanguageData, getString, selectedLanguage, data[selectedLanguage] || LanguageData];
};
