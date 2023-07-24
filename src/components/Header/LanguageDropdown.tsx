import React, { useContext } from "react";
import { Dropdown } from "semantic-ui-react";
import { SUPPORT_LOCALES } from "../../config/Locales";
import { AppRuntimeSettingsContext } from "../../context";

function LanguageDropdown() {
  const { language } = useContext(AppRuntimeSettingsContext);

  // Temporarily hidden
  return null;

  return (
    <Dropdown text="Язык" item>
      <Dropdown.Menu>
        {SUPPORT_LOCALES.map((locale) => {
          return (
            <Dropdown.Item
              key={locale}
              active={locale === language.currentLocale}
              onClick={() => {
                language.selectLanguage(locale);
              }}
            >
              {locale}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default LanguageDropdown;
