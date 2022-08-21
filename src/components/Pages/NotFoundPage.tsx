import { Link } from "react-router-dom";
import { Button, Container, Grid, Header } from "semantic-ui-react";
import "./NotFoundPage.scss";
import MetaRobots from './../Meta/MetaRobots';
import React from "react";

function NotFoundPage() {
  return (
    <Container className="not-found">
      <MetaRobots noIndex/>
      <div className="centerd">
        <Grid centered>
          <Grid.Row>
            <Header>Страницы нет</Header>
          </Grid.Row>
          <Grid.Row>
            <Button to="/" as={Link} color="green">На главную</Button>
          </Grid.Row>
        </Grid>
      </div>
    </Container>
  );
}

export default NotFoundPage;
