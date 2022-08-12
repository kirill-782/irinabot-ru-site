import React from "react";
import "./BlurImage.scss";

interface BlurImageProps {
  imageSrc: string;
  imageAlt: string;
}

function BlurImage({
  imageSrc,
  imageAlt
}: BlurImageProps) {

  return (
    <img className="blurred-img" src={imageSrc} alt={imageAlt} />
  );
}

export default BlurImage;
