import { useContext, useEffect } from "react";
import { Dropdown, Icon } from "semantic-ui-react";
import { AuthMethod, AviableAuthMethods } from "../../config/AuthMethods";
import { AuthContext, AuthCredentials } from "./../../context/index";
import { toast } from "react-semantic-toasts";

function LoginDropdown() {
  const authContext = useContext(AuthContext);

  const authByOauth = (data: AuthMethod) => {
    // Build oauth url

    const state = (Math.random() + 1).toString(36).substring(2);

    const urlParser = new URLSearchParams();
    urlParser.append("client_id", data.client_id);
    urlParser.append("scope", data.scope);
    urlParser.append("response_type", "token");
    urlParser.append("redirect_uri", window.location.origin + "/oauth");
    urlParser.append("state", state);

    const oauthWindow = window.open(
      data.oauthEndpoint + "?" + urlParser.toString(),
      state,
      "popup"
    );

    const onStorage = (e: StorageEvent) => {
      if (e.key.startsWith(state)) {
        if (e.key.substring(state.length + 1) === "token") {
          window.localStorage.setItem("authTokenType", data.type.toString());
          window.localStorage.setItem("authToken", e.newValue);

          authContext.dispatchAuth({
            action: "saveCredentials",
            payload: { token: e.newValue, type: data.type },
          });
        } else {
          toast({
            title: "Ошибка",
            description: e.newValue,
            type: "error",
            time: 10000,
          });
        }

        window.localStorage.removeItem(e.key);
      }
    };

    window.addEventListener("storage", onStorage);
    oauthWindow.addEventListener("close", () => {
      window.removeEventListener("storage", onStorage);
    });
  };

  return (
    <Dropdown text="Войти" item>
      <Dropdown.Menu>
        {AviableAuthMethods.map((method: AuthMethod) => {
          return (
            <Dropdown.Item
              key={method.name}
              onClick={() => authByOauth(method)}
            >
              {method.name}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default LoginDropdown;
