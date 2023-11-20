import { useEffect, useRef } from "react";
import { DOMAIN_TO_LOCALE_MAP } from "../config/Locales";

export const useLinkAlternate = () => {
    const elements = useRef<Record<string, HTMLLinkElement>>();

    const updateLinks = () => {
        if (!elements.current) {
            elements.current = {};

            Object.entries(DOMAIN_TO_LOCALE_MAP).map((i) => {
                elements.current[i[0]] = document.createElement("link");
                elements.current[i[0]].rel = "alternate";
                elements.current[i[0]].hreflang = i[1];

                document.head.appendChild(elements.current[i[0]]);
            });
        }

        Object.entries(elements.current).forEach((i) => {
            i[1].href = `${document.location.protocol}//${i[0]}${document.location.pathname}`;
        });
    };

    useEffect(() => {
        const onPopState = () => {
            updateLinks();
        };

        updateLinks();

        window.addEventListener("popstate", onPopState);

        return () => {
            window.removeEventListener("popstate", onPopState);

            Object.values(elements.current).forEach((i) => {
                i.remove();
            });
        };
    }, []);
};
