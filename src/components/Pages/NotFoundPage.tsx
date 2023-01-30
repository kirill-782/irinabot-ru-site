import { Link } from "react-router-dom";
import { Button, Container, Grid, Header } from "semantic-ui-react";
import "./NotFoundPage.scss";
import MetaRobots from "./../Meta/MetaRobots";
import React, { useContext } from "react";
import { AppRuntimeSettingsContext } from "../../context";

function NotFoundPage() {

  const {language} = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  
  return (
    <Container className="not-found">
      <MetaRobots noIndex />
      <div className="centerd">
        <Grid centered>
          <Grid.Row>
            <Header>{t("page.nf404")}</Header>
          </Grid.Row>
          <Grid.Row>
            <Button to="/" as={Link} color="green">
            {t("page.tomain")}
            </Button>
          </Grid.Row>
        </Grid>
      </div>
    </Container>
  );
}

export default NotFoundPage;
