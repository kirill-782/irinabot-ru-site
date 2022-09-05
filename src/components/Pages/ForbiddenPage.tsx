import React from "react";
import { useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  Dropdown,
  Grid,
  Header,
  Loader,
  Segment,
} from "semantic-ui-react";
import { AuthMethod, AviableAuthMethods } from "../../config/AuthMethods";
import { AuthContext, WebsocketContext } from "../../context";
import { authByOauth } from "../../utils/Oauth";
import MetaRobots from "../Meta/MetaRobots";

interface ForbiddenPageProps {
  missingAuthorities?: string[];
  missingAuth?: boolean;
}

function ForbiddenPage({
  missingAuthorities,
  missingAuth,
}: ForbiddenPageProps) {
  const authContext = useContext(AuthContext);
  const { isGHostSocketConnected } = useContext(WebsocketContext);

  const onSuccess = useCallback(
    (token: string, type: number) => {
      authContext.dispatchAuth({
        action: "saveCredentials",
        payload: { token, type },
      });
    },
    [authContext]
  );

  const loginHint = (
    <>
      <p>У вас нет доступа к этой странице. Попробуйте войти на сайт через:</p>
      <Grid.Row>
        {AviableAuthMethods.map((method: AuthMethod) => {
          return (
            <Button
              key={method.name}
              color={method.color}
              onClick={() => authByOauth(method, onSuccess)}
            >
              {method.name}
            </Button>
          );
        })}
      </Grid.Row>
    </>
  );

  const waitLoader = (
    <>
      <p>
        Подолжите, когда завершится подключение к серверу, и пройдет авторизация
      </p>
      <Grid.Row>
        <Header>
          {isGHostSocketConnected ? "Авторизация. . ." : "Подключение . . ."}
        </Header>
      </Grid.Row>
    </>
  );

  return (
    <Container className="not-found">
      <MetaRobots noIndex />
      <div className="centerd">
        <Grid centered>
          <Grid.Row>
            <Header>Отказано в доступе</Header>
          </Grid.Row>
          {!authContext.auth.currentAuth ? (
            authContext.auth.authCredentials ? (
              waitLoader
            ) : (
              loginHint
            )
          ) : (
            <Grid.Row>
              <p>
                У вас отсуствую необходимые права для доступа к данной странице
              </p>
            </Grid.Row>
          )}

          <Grid.Row>
            <Button to="/" as={Link} color="green">
              На главную
            </Button>
          </Grid.Row>
        </Grid>
      </div>
    </Container>
  );
}

export default ForbiddenPage;
