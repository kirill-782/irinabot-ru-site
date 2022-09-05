import React from "react";
import { useContext, useEffect, useState } from "react";
import { Label } from "semantic-ui-react";
import { CacheContext, RestContext } from "../../context";
import { Category } from "../../models/rest/Category";

interface MapCategoryListProps {
  categories?: number[];
}

function MapCategoryList({ categories }: MapCategoryListProps) {
  const cacheContext = useContext(CacheContext);

  useEffect(() => {
    if (cacheContext.cachedCategories.length === 0)
      cacheContext.cacheCategories();
  }, [cacheContext.cachedCategories, cacheContext.cacheCategories]);

  return (
    <>
      {cacheContext.cachedCategories
        .filter((category) => {
          return categories?.indexOf(category.id || 0) !== -1;
        })
        .map((category) => {
          return <Label key={category.id}>{category.name}</Label>;
        })}
    </>
  );
}

export default MapCategoryList;
