import React from "react";
import { useEffect, useState } from "react";

interface SitePrepareLoaderProps {
  noWait?: boolean;
}

function SitePrepareLoader({ noWait }: SitePrepareLoaderProps) {
  const [needRender, setNeedRender] = useState<boolean>(noWait || false);
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setNeedRender(true);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  return needRender ? (
    <h1>Фиксики размещают теги по местам, ожидайте</h1>
  ) : null;
}

export default SitePrepareLoader;
