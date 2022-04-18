import { useMemo } from "react";
import { Category } from "../models/rest/Category";

export const useCategoryFilter = (
  selectedCategories: number[],
  categories: Category[],
  maxSelected: number
) => {
  const hasSingleton = (categoryId) => {
    for (let i = 0; i < categories.length; ++i) {
      if (categoryId === categories[i].id) return categories[i].singleton;
    }

    return false;
  };

  return useMemo(() => {
    let selectableCategories = [];

    // If noting selected - allow select all categories
    if (!selectedCategories.length) selectableCategories = categories;
    // if selected one - chech singleton category.
    else if (selectedCategories.length === 1) {
      let singletonCategorySelected = hasSingleton(selectedCategories[0]);

      // Disable select other categories
      if (singletonCategorySelected) {
        selectableCategories = categories.filter((category) => {
          return category.id === selectedCategories[0];
        });
      }
      // Disable select singleton categories
      else {
        selectableCategories = categories.filter((category) => {
          return !category.singleton;
        });
      }
    }
    // Set selection limit
    else if (selectedCategories.length === maxSelected) {
      selectableCategories = categories.filter(
        (category) =>
          selectedCategories.find((e) => category.id === e) !== undefined
      );
    } else {
      selectableCategories = categories.filter((category) => {
        return !category.singleton;
      });
    }

    return selectableCategories.map(
      (category) => {
        return { text: category.name, value: category.id };
      },
      [selectedCategories, categories]
    );
  }, [categories, selectedCategories]);
};
