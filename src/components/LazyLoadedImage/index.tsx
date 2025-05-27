import React, { useEffect, useRef, useState } from "react";
import "./LazyLoadedImage.scss";
import { ImageProps, Image as ImageComponent } from "semantic-ui-react";
import { useVisibility } from "../../hooks/useVisibility";

import classnames from "classnames";

const IMAGE_STUB_SRC =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

interface LazyLoadedImageProps extends ImageProps {
    forceLoaded?: boolean;
    blured?: boolean;
}

function LazyLoadedImage({ src, forceLoaded, blured, ...props }: LazyLoadedImageProps) {
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const [isLoaded, setLoaded] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(!!forceLoaded);

    const isVisiable = useVisibility(img);

    useEffect(() => {
        if (isVisiable && !isLoaded && !isLoading) {
            setLoading(true);
        }
    }, [isLoaded, isVisiable, isLoading]);

    useEffect(() => {
        const onReady = () => {
            setLoaded(true);
        };

        if (isLoading && !isLoaded) {
            const image = new Image();
            image.src = src;
            image.addEventListener("load", onReady);
            image.addEventListener("error", onReady);

            return () => {
                image.removeEventListener("load", onReady);
                image.removeEventListener("error", onReady);
            };
        }
    }, [isLoaded, isLoading]);

    return (
        <ImageComponent
            ref={(el) => {
                setImg(el as HTMLImageElement);
            }}
            className={classnames({ "lazy-load-img": true, blured })}
            src={isLoaded ? src : IMAGE_STUB_SRC}
            {...props}
        />
    );
}

export default LazyLoadedImage;
