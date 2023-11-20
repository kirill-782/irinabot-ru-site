import React from "react";
import { useEffect, useState } from "react";

interface SitePrepareLoaderProps {
    noWait?: boolean;
}

function SitePrepareLoader({ noWait }: SitePrepareLoaderProps) {
    const [needRender, setNeedRender] = useState<boolean>(noWait || false);

    //const {language} = useContext(AppRuntimeSettingsContext);
    //const lang = language.languageRepository;

    useEffect(() => {
        const timerId = setTimeout(() => {
            setNeedRender(true);
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, []);

    return needRender ? <h1>Фиксики размещают теги по местам, ожидайте{/*lang.fixics*/}</h1> : null;
}

export default SitePrepareLoader;
