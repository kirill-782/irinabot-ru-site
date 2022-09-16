import React from "react";
import { useContext, useEffect } from "react";
import { Label } from "semantic-ui-react";
import { CacheContext } from "../../context";
import { Link } from 'react-router-dom';
import "./MapCategoryList.scss"

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
    <div className="map-category-list">
      {cacheContext.cachedCategories
        .filter((category) => {
          return categories?.indexOf(category.id || 0) !== -1;
        })
        .map((category) => {
          return <Label as={Link} to={`/?category=${category.id}`} key={category.id}>{category.name}</Label>;
        })}
    </div>
  );
}

export default MapCategoryList;
