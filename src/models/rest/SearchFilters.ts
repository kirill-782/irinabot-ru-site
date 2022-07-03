/** Фильтры в запросе поиска. */
export interface SearchFilters {
  /** Только верефицированные карты. */
  verify?: boolean;
  /** Игроков больше чем.  */
  minPlayers?: number;
  /** Игроков меньше чем.  */
  maxPlayers?: number;
  /** Сортировка по полю. */
  sortBy?: string;
  /** Порядок сортировки. */
  orderBy?: string;
  /** Только карты из заданной категории */
  category?: number[];
}
