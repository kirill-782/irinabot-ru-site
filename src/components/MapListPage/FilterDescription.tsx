import React from "react";
import { useContext, useEffect } from "react";
import { Header, Message } from "semantic-ui-react";
import { CacheContext } from "../../context";
import { SearchFilters, SearchOrder } from "../../models/rest/SearchFilters";

interface FilterDescriptionProps {
  filters: [SearchFilters | null, SearchOrder | null];
}

function FilterDescription({ filters }: FilterDescriptionProps) {
  const cacheContext = useContext(CacheContext);

  useEffect(() => {
    if (cacheContext.cachedCategories.length === 0)
      cacheContext.cacheCategories();
  }, [cacheContext]);

  if (filters[0]?.category !== undefined) {
    const category = cacheContext.cachedCategories.find(
      (i) => i.id === filters[0]?.category
    );

    if (category) {
      return (
        <Message info>
          <Header>{category.name}</Header>
          <p>{category.description}</p>
        </Message>
      );
    }
  }

  return null;
}

export default FilterDescription;
