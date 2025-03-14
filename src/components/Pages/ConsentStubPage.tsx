import React from "react";
import { useContext } from "react";
import { Container, Message } from "semantic-ui-react";
import { AuthContext } from "../../context/index";

export default function ConsentStubPage() {
    const { auth } = useContext(AuthContext);

    if (!auth.currentAuth?.nickname) {
        return (
            <Container>
                <Message error>Установите никнейм коннетора, чтобы продожить</Message>
            </Container>
        );
    }

    const urlParser = new URLSearchParams(window.location.search.substring(1));

    const code = btoa(JSON.stringify({
        token: auth.authCredentials.token,
        type: auth.authCredentials.type
    }));

    document.location.href = `http://127.0.0.1:14771/token/?code=${encodeURIComponent(code)}&state=${urlParser.get('state')}`;
}
