export enum E_THEME {
  LIGHT = "light",
  DARK = "dark",
}

const themeKeyInLocalStorage = "theme";

/** Получение текущей темы */
export const getTheme = (): E_THEME =>
  (localStorage.getItem(themeKeyInLocalStorage) as E_THEME) || E_THEME.LIGHT;

/** Загрузка темы из semantic-ui-sass
 *
 * @param {E_THEME} themeName Название темы (dark, light и т.д)
 */
export const loadTheme = () => {
  const theme = getTheme();
  console.log("theme? ", theme);
  if (theme === E_THEME.LIGHT) {
    return;
  }
  require(`../semantic-ui-sass/${theme}/_index.scss`);
};

/** Переключение темы сайта
 *
 * @param {E_THEME} themeName Название темы (dark, light и т.д)
 */
export const switchTheme = (themeName: E_THEME) => {
  console.log("switch theme", themeName);
  localStorage.setItem(themeKeyInLocalStorage, themeName);
  document.location.reload();
};
