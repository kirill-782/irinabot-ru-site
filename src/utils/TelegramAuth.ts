import { toast } from "@kokomi/react-semantic-toasts";
import { AuthMethod } from "../config/AuthMethods";

export const authByTelegram = (data: AuthMethod, onSuccess: (token: string, type: number) => void) => {
    // Build oauth url

    if (data.customImpl !== "telegram") return;
    if(!data.customData.domainMap[document.location.host]) return;

    const state = (Math.random() + 1).toString(36).substring(2);



    const urlParser = new URLSearchParams();
    urlParser.append(
        "returnPath",
        `${data.customData.domainMap[document.location.host]}/${state}`
    );

    const oauthWindow = window.open(data.oauthEndpoint + "?" + urlParser.toString(), state, "popup");

    if (!oauthWindow) return;

    const onStorage = (e: StorageEvent) => {
        const storegeKey = e.key;
        const storegeNewValue = e.newValue;

        if (storegeKey && storegeNewValue) {

debugger;

            if (e.key.startsWith(state)) {
                if (e.key.substring(state.length + 1) === "token") {
                    window.localStorage.setItem("authTokenType", data.type.toString());
                    window.localStorage.setItem("authToken", e.newValue);

                    onSuccess(e.newValue, data.type);
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
