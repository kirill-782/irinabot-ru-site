import React, { useEffect, useState } from "react";
import { Container, Grid, Input } from "semantic-ui-react";
import { useParams } from "react-router-dom";
import Markdown from "../Markdown";
import { GameListGame } from "../../models/websocket/ServerGameList";


function HelpPage() {
    const { section, article } = useParams();

    const [leftBar, setLeftBar] = useState<string>("");
    const [rightBar, setRightBar] = useState<string>("");

    useEffect(() => {
        if(!section) {
            setLeftBar("Левый бар принял ислам");
            return;
        }

        if (section) {
            fetch(`/markdown/help/${section}.md`).then(async (response) => {
                if(response.status === 200) {
                    setLeftBar(await response.text());
                }
            });
        }
    }, [section]);

    useEffect(() => {
        if(!article) {
            setRightBar("Правый бар принял ислам");
            return;
        }

        if (section && article) {
            fetch(`/markdown/help/${section}/${article}.md`).then(async (response) => {
                if(response.status === 200) {
                    setRightBar(await response.text());
                }
            });
        }
    }, [section, article]);

    return (
        <Container>
            <Grid columns="equal" stackable>
                <Grid.Column width={3}>
                    <Markdown>
                        {leftBar}
                    </Markdown>
                </Grid.Column>
                <Grid.Column width={13}>
                    <Markdown>
                        {rightBar}
                    </Markdown>
                </Grid.Column>
            </Grid>
        </Container>
    );
}

export default HelpPage;