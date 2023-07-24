import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { AppRuntimeSettingsContext } from "../context";

interface SitePrepareLoaderProps {
    noWait?: boolean;
}

function SitePrepareLoader({ noWait }: SitePrepareLoaderProps) {
    const [needRender, setNeedRender] = useState<boolean>(noWait || false);
    const [timer, setTimer] = useState<number>(0);

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
