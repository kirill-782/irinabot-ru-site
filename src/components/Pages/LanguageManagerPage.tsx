import React, { useContext, useEffect, useState } from "react";
import { Container, Form, Header } from "semantic-ui-react";
import { DEFAULT_CONFIG } from "../../config/ApiConfig";
import { SUPPORT_LOCALES } from "../../config/Locales";
import { AppRuntimeSettingsContext } from "../../context";

const languageOptions = SUPPORT_LOCALES.map((i) => {
    return {
        key: i,
        value: i,
        text: i,
    };
});

interface LanguageKey {
    forDelete?: boolean;
    isLoading?: boolean;
    isError?: boolean;
    key: string;
    value: string;
}

function LanguageManagerPage() {
    const { language } = useContext(AppRuntimeSettingsContext);
    const [activeLocale, setActiveLocale] = useState(language.currentLocale);

    const [languageKeys, setLanguageKeys] = useState<LanguageKey[]>([]);

    useEffect(() => {
        (async () => {
            const keys = await (await fetch(`${DEFAULT_CONFIG.baseURL}v1/lang?locale=${activeLocale}`)).json();
            setLanguageKeys(
                Object.entries(keys).map((i) => {
                    return {
                        key: i[0],
                        value: i[1] as string,
                    };
                })
            );
        })();
    }, [activeLocale]);

    console.log(languageKeys);

    return (
        <Container>
            <Header>Редактор языкового пакета</Header>
            <Form>
                <Form.Select
                    options={languageOptions}
                    value={activeLocale}
                    onChange={(_, data) => {
                        setActiveLocale(data.value.toString());
                    }}
                    label="Редактируемый языковой пакет"
                ></Form.Select>
                {languageKeys.map((languageKey) => {
                    return (
                        <Form.Group unstackable key={languageKey.key} fluid>
                            <Form.Input width={5} value={languageKey.key}></Form.Input>
                            <Form.Input width={12} value={languageKey.value}></Form.Input>
                        </Form.Group>
                    );
                })}
            </Form>
        </Container>
    );
}

export default LanguageManagerPage;
