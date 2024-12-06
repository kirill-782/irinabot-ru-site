import { useCallback, useContext } from "react";
import { Dropdown } from "semantic-ui-react";
import { AuthMethod, AviableAuthMethods } from "../../config/AuthMethods";
import { AppRuntimeSettingsContext, AuthContext } from "../../context";
import { authByOauth } from "../../utils/Oauth";
import { authByTelegram } from "../../utils/TelegramAuth";
import React from "react";

function LoginDropdown() {
    const authContext = useContext(AuthContext);

    const onSuccess = useCallback(
        (token: string, type: number) => {
            authContext.dispatchAuth({
                action: "saveCredentials",
                payload: { token, type },
            });
        },
        [authContext]
    );

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    return (
        <Dropdown text={lang.loginDropdownOption} item>
            <Dropdown.Menu>
                {AviableAuthMethods.map((method: AuthMethod) => {
                    switch (method.customImpl) {
                        case "telegram": {
                            return (
                                <Dropdown.Item key={method.name} onClick={() => authByTelegram(method, onSuccess)}>
                                    {method.name}
                                </Dropdown.Item>
                            );
                        }
                        default: {
                            return (
                                <Dropdown.Item key={method.name} onClick={() => authByOauth(method, onSuccess)}>
                                    {method.name}
                                </Dropdown.Item>
                            );
                        }
                    }
                })}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default LoginDropdown;
