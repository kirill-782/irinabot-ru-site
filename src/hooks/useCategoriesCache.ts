import { useCallback, useContext } from "react";
import { RestContext } from "../context";
import { useState } from "react";
import { Category } from "../models/rest/Category";
import { MapService } from "./../services/MapService";

export const useCategoriesCache = (mapsApi: MapService): [Category[], () => void] => {
    const [isLoading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const load = useCallback(() => {
        if (!isLoading && categories.length === 0) {
            setLoading(true);
            mapsApi
                .getCategories()
                .then(setCategories)
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isLoading, categories, mapsApi]);

    return [categories, load];
};
