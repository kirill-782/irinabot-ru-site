import { useContext, useMemo } from "react";
import { AuthContext } from "../context/index";
import { Category } from "../models/rest/Category";

export const useCategoryFilter = (selectedCategories: number[], categories: Category[], maxSelected: number) => {

    const auth = useContext(AuthContext).auth;

    return useMemo(() => {
        const hasSingleton = (categoryId) => {
            for (let i = 0; i < categories.length; ++i) {
                if (categoryId === categories[i].id) return categories[i].singleton;
            }

            return false;
        };

        let filtredCategories = categories.filter(i => {
            return !i.accessFroSet //|| auth.apiToken.hasAuthority(i.accessFroSet);
        })

        let selectableCategories = [];

        // If noting selected - allow select all categories
        if (!selectedCategories.length) selectableCategories = filtredCategories;
        // if selected one - chech singleton category.
        else if (selectedCategories.length === 1) {
            let singletonCategorySelected = hasSingleton(selectedCategories[0]);

            // Disable select other categories
            if (singletonCategorySelected) {
                selectableCategories = filtredCategories.filter((category) => {
                    return category.id === selectedCategories[0];
                });
            }
            // Disable select singleton categories
            else {
                selectableCategories = filtredCategories.filter((category) => {
                    return !category.singleton;
                });
            }
        }
        // Set selection limit
        else if (selectedCategories.length === maxSelected) {
            selectableCategories = filtredCategories.filter(
                (category) => selectedCategories.find((e) => category.id === e) !== undefined
            );
        } else {
            selectableCategories = filtredCategories.filter((category) => {
                return !category.singleton;
            });
        }

        return selectableCategories.map(
            (category) => {
                return { text: category.name, value: category.id };
            },
            [selectedCategories, filtredCategories]
        );
    }, [categories, selectedCategories, maxSelected, auth]);
};
