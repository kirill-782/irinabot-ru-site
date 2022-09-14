import { toast } from "@kokomi/react-semantic-toasts";
import { AuthMethod } from "../config/AuthMethods";

export const authByOauth = (data: AuthMethod, onSuccess: (token: string, type: number) => void) => {
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

  if (!oauthWindow) return;

  const onStorage = (e: StorageEvent) => {
    const storegeKey = e.key;
    const storegeNewValue = e.newValue;

    if (storegeKey && storegeNewValue) {
      if (e.key.startsWith(state)) {
        if (e.key.substring(state.length + 1) === "token") {
          window.localStorage.setItem("authTokenType", data.type.toString());
          window.localStorage.setItem("authToken", e.newValue);

          onSuccess(e.newValue, data.type );
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
    }
  };

  window.addEventListener("storage", onStorage);
  oauthWindow.addEventListener("close", () => {
    window.removeEventListener("storage", onStorage);
  });
};