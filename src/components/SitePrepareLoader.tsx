import { useEffect, useState } from "react";

function SitePrepareLoader() {
  const [needRender, setNeedRender] = useState<boolean>(false);
  useEffect(() => {
    const timerId = setTimeout(() => {
      setNeedRender(true);
    }, 500);
  }, [setNeedRender]);

  return needRender ? (
    <h1>Фиксики размещают теги по местам, ожидайте</h1>
  ) : null;
}

export default SitePrepareLoader;
