export namespace FavoriteMaps {
    const localStorageMapKey = "fav-maps";

    export const addMap = (id: number) => {
        const maps = listMaps().add(id);
        localStorage.setItem(localStorageMapKey, JSON.stringify(Array.from(maps)));
    };
    export const removeMap = (id: number) => {
        const maps = listMaps();
        maps.delete(id);
        localStorage.setItem(localStorageMapKey, JSON.stringify(Array.from(maps)));
    };
    export const cleanMaps = () => {
        localStorage.setItem(localStorageMapKey, JSON.stringify([]));
    };

    export const listMaps = (): Set<number> => {
        return new Set<number>(JSON.parse(localStorage.getItem(localStorageMapKey) || "[]"));
    };
}
