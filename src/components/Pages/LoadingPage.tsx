import React from "react";
import { Loader } from "semantic-ui-react";

function LoadingPage() {
  return (
    <Loader active size="massive">
      Загрузка страницы
    </Loader>
  );
}

export default LoadingPage;
