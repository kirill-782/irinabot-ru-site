import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context";
import { FilterSettings } from "./useGameListFilter";

const gameListFilterLocalStorageKey = "gameListFilters";

const defaultFilterSettings: FilterSettings = {
  quicFilter: "",
  noLoadStarted: true,
  onlySelfGames: false,
  gameType: 0,
  orderBy: "default",
  reverseOrder: false,
  players: [0, 24],
  slots: [0, 24],
  freeSlots: [0, 24],
};

export const useGameListFilterSetings = () => {
  const auth = useContext(AuthContext).auth;

  const [filterSettings, setFilterSettings] = useState<FilterSettings>(
    defaultFilterSettings
  );
  const [disabledFilters, setDisabledFilters] = useState<string[]>([]);

  const disableFilter = (filterName: string, value?: any) => {
    setDisabledFilters([...disabledFilters, filterName]);

    if (value !== undefined) {
      filterSettings["filterName"] = value;
      setFilterSettings({ ...filterSettings });
    }
  };

  const enableFilter = (filterName: string) => {
    let disabledFilterIndex = disabledFilters.indexOf(filterName);

    while (disabledFilterIndex > -1) {
      disabledFilters.splice(disabledFilterIndex, 1);
      disabledFilterIndex = disabledFilters.indexOf(filterName);
    }

    setDisabledFilters([...disabledFilters]);
  };

  // Load filters from localStorage
  useEffect(() => {
    const storedFilterSettings = localStorage.getItem(
      gameListFilterLocalStorageKey
    );

    if (!storedFilterSettings) return;

    try {
      setFilterSettings((filterSettings) => {
        return {
          ...filterSettings,
          ...JSON.parse(storedFilterSettings),
        };
      });
    } catch (e) {}
  }, []);

  // Authorization dependent filters
  useEffect(() => {
    if (auth.currentAuth) enableFilter("onlySelfGames");
    else if (!auth.authCredentials) disableFilter("onlySelfGames");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentAuth, auth.authCredentials]);

  useEffect(() => {
    localStorage.setItem(
      gameListFilterLocalStorageKey,
      JSON.stringify(filterSettings)
    );
  }, [filterSettings]);

  return {
    filterSettings,
    disabledFilters,
    setFilterSettings,
    enableFilter,
    disableFilter,
  };
};
