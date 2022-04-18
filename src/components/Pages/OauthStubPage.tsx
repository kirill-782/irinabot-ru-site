function OauthStubPage() {
  const urlParser = new URLSearchParams(window.location.hash.substring(1));

  if (urlParser.has("access_token"))
    localStorage.setItem(
      urlParser.get("state") + "_token",
      urlParser.get("access_token")
    );
  else {
    localStorage.setItem(
      urlParser.get("state") + "_error",
      urlParser.get("error") + ": " + urlParser.get("error_description")
    );
  }

  window.close();

  return (
    <span>
      Я окошко интроверт. Мне не нравится, что на меня кто то смотрит. Закрой
      пожалуйста меня.
    </span>
  );
}

export default OauthStubPage;
