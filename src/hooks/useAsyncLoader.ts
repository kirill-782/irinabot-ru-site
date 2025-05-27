import { useCallback, useEffect, useState } from "react";

type AsyncCallback<T> = () => Promise<T>;

export function useAsyncLoader<T, E>(
    callback: AsyncCallback<T>,
    initData: T,
    autoLoad?: boolean
): [T, boolean, unknown | null, () => void] {
    const [data, setData] = useState(initData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            setData(await callback());
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [callback]);

    useEffect(() => {
        if (autoLoad) load();
    }, [load, autoLoad]);


    return [data, isLoading, error, load];
}
