import { useEffect } from "react";
import { SITE_TITLE } from "../config/ApplicationConfig";

export function useTitle(...section: string[]) {
    useEffect(() => {
        window.document.title = [section, SITE_TITLE].filter((i) => i).join(" | ");

        return () => {
            window.document.title = SITE_TITLE;
        };
    }, [section]);
}
