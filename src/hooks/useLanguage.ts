import TimeAgo from "javascript-time-ago";
import { useCallback, useState } from "react";
import { importLocales } from "../utils/LocaleUtils";

type stringMap = {
  [key: string]: string | boolean | number | null | undefined;
};

export type GetLanguageStaring = (
  id: string,
  options?: stringMap,
  language?: string
) => string;

type UseLanguageResult = [
  (language: string) => void,
  (language: string, data: any) => void,
  GetLanguageStaring,
  string
];

export const useLanguage = (): UseLanguageResult => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [data, setData] = useState<any>({});

  const getString = useCallback(
    (id: string, options?: stringMap, language?: string): string => {
      const currentLanguage = language || selectedLanguage;
      const languagePath = `${currentLanguage}.${id}`;

      let result = data;

      languagePath.split(".").map((i) => {
        if (typeof result === "object") {
          result = result[i];
        } else result = undefined;
      });

      if (result === undefined) return languagePath;

      if (options) {
        Object.entries(options).forEach((i) => {
          result = result.replaceAll(`{${i[0]}}`, i[1].toString());
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
      return { ...data, [language]: updateData };
    });
  };

  const loadLanguage = useCallback(async (language: string) => {
    const result = await importLocales(language);

    TimeAgo.addLocale(result.timeAgo.default);
    TimeAgo.addDefaultLocale(result.timeAgo.default);
    pushLanguageData(language, result.site.default);

    setSelectedLanguage(language);

    return true;
  }, []);

  return [loadLanguage, pushLanguageData, getString, selectedLanguage];
};
