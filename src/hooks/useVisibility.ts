import { useEffect, useState } from "react";

export const useVisibility = (
  el: HTMLElement | null,
  options?: IntersectionObserverInit
): boolean => {
  const [isVisible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (el) {
      const callback = (entries, observer) => {
        if (entries[0].intersectionRatio > 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      };

      const observerApi = new IntersectionObserver(callback, options);
      observerApi.observe(el);
      return () => {
        setVisible(false);
        observerApi.disconnect();
      };
    }
  }, [el]);

  return isVisible;
};
