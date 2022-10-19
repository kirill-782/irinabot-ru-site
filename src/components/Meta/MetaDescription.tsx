import { useEffect } from "react";

interface MetaDescriptionProps {
  description: string;
}

function MetaDescription({ description }: MetaDescriptionProps) {
  useEffect(() => {
    const descriptionTag = document.createElement("meta");

    descriptionTag.setAttribute("name", "description");
    descriptionTag.setAttribute("content", description);

    document.head.appendChild(descriptionTag);

    return () => {
      document.head.removeChild(descriptionTag);
    };
  }, [description]);

  return null;
}

export default MetaDescription;
