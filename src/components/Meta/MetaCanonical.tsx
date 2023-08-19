import { useEffect } from "react";

interface MetaCanonicalProps {
    link?: string;
    hostPath?: string;
}

function MetaCanonical({ link, hostPath }: MetaCanonicalProps) {
    useEffect(() => {
        if (!link && !hostPath) return;

        const linkElement = document.createElement("link");

        linkElement.setAttribute("rel", "canonical");
        linkElement.setAttribute("href", link ? link : window.location.origin + hostPath);

        document.head.appendChild(linkElement);

        return () => {
            document.head.removeChild(linkElement);
        };
    }, [link, hostPath]);

    return null;
}

export default MetaCanonical;
