import React from "react";
import { useState } from "react";
import { Container } from "semantic-ui-react";

function ErrorCatch({ children }) {
  const [hasError, setError] = useState(false);

  if (hasError)
    return (
      <Container>
        На сайте произошла ошибка. Проверьте интернет соединение, обновите
        страницу или обратитесь к администратору
      </Container>
    );

  try {
    return children;
  } catch (e) {
    console.error(e);
    setError(true);
  }
}

export default ErrorCatch;
