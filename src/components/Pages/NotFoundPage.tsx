import { Link } from "react-router-dom";
import { Button, Container, Grid, Header } from "semantic-ui-react";
import "./NotFoundPage.scss";
import MetaRobots from "./../Meta/MetaRobots";
import React, { useContext } from "react";
import { AppRuntimeSettingsContext } from "../../context";

function NotFoundPage() {
  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  return (
    <Container className="not-found">
      <MetaRobots noIndex />
      <div className="centerd">
        <Grid centered>
          <Grid.Row>
            <Header>{lang.notFoundPageTitle}</Header>
          </Grid.Row>
          <Grid.Row>
            <Button to="/" as={Link} color="green">
              {lang.notFoundPageGoToHome}
            </Button>
          </Grid.Row>
        </Grid>
      </div>
    </Container>
  );
}

export default NotFoundPage;
