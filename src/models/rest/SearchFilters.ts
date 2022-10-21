/** Фильтры в запросе поиска. */
export interface SearchOrder {
  /** Сортировка по полю. */
  sortBy?: string;
  /** Порядок сортировки. */
  orderBy?: string;
}

/** Фильтры в запросе поиска. */
export interface SearchFilters {
  /** Только верефицированные карты. */
  verify?: boolean;
  /** Только с отметкой карты.*/
  taggedOnly?: boolean;
  /** Игроков больше чем.  */
  minPlayers?: number;
  /** Игроков меньше чем.  */
  maxPlayers?: number;
  /** Только карты из заданной категории */
  category?: number;
  /** Фильтр по владельцу */
  owner?: string;
  /** Только избранные карты */
  favorite?: boolean;
  /** Получить карты с заданным ID */
  mapIds?: string;
}
