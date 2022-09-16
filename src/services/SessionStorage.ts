export namespace SessionStorage {
  const SESSION_STORAGE_KEY = "sessionStorage";

  let storage =
    JSON.parse(window.sessionStorage.getItem(SESSION_STORAGE_KEY)) || {};

  window.addEventListener("unload", () => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storage));
  });

  export const save = <T>(historyKey: string, key: string, value: T) => {
    if (!storage[historyKey]) storage[historyKey] = {};

    storage[historyKey][key] = value;
  };

  export const get = <T>(historyKey: string, key: string): T => {
    if (!storage[historyKey]) storage[historyKey] = {};

    return storage[historyKey][key];
  };

  export const clear = (historyKey: string) => {
    storage[historyKey] = {};
  };

  export const remove = (historyKey: string, key: string) => {
    if (!storage[historyKey]) return;

    delete storage[historyKey][key];
  };
}
