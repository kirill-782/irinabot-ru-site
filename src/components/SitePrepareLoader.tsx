import React from "react";
import { useEffect, useState } from "react";

interface SitePrepareLoaderProps {
  noWait?: boolean;
}

function SitePrepareLoader({ noWait }: SitePrepareLoaderProps) {
  const [needRender, setNeedRender] = useState<boolean>(noWait || false);
  useEffect(() => {
    const timerId = setTimeout(() => {
      setNeedRender(true);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [setNeedRender]);

  return needRender ? (
    <h1>Фиксики размещают теги по местам, ожидайте</h1>
  ) : null;
}

export default SitePrepareLoader;
