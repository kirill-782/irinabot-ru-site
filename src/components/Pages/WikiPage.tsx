import React, { memo, useEffect, useState } from "react";
import { Container, Dropdown, Grid, Menu } from "semantic-ui-react";
import Markdown from "../Markdown";
import { NavLink, useParams } from "react-router-dom";
import { useTitle } from "../../hooks/useTitle";
import { DEFAULT_LOCALE } from "../../config/Locales";

interface ArticleNode {
    id: number;
    url?: string;
    title: string;
    locale: string;
}

interface Article {
    id: number;
    url?: string;
    title: string;
    payload: string;
    locale: string;
}

function WikiPage() {

    const [articleList, setArticleList] = useState<ArticleNode[]>([]);
    const [currentArticle, setCurrentArticle] = useState<Article>();

    const { wiki, article } = useParams();

    useEffect( () => {
        (async () => {
            const response = await fetch(`https://api.irinabot.ru/v1/wiki/${wiki}/articles?locale=${DEFAULT_LOCALE}`);
            setArticleList(await response.json());
        })()
    }, [wiki]);

    useEffect( () => {
        (async () => {
            const response = await fetch(`https://api.irinabot.ru/v1/wiki/${wiki}/article/${article || "index"}?locale=${DEFAULT_LOCALE}`);
            setCurrentArticle(await response.json());
        })()
    }, [wiki, article]);

    useTitle(currentArticle?.title, "Wiki")

    return (
        <Container>
            <Grid columns="equal" stackable>
                <Grid.Column width={3}>
                    <Menu text vertical>
                        {
                            articleList.map(article => {
                                return (
                                    <Menu.Item
                                        as={NavLink}
                                        to={`/wiki/${wiki}/${article.url}`}
                                    >{article.title}</Menu.Item>
                                );
                            })
                        }

                    </Menu>
                </Grid.Column>
                <Grid.Column width={13}>
                    <Markdown>
                        {currentArticle?.payload}
                    </Markdown>
                </Grid.Column>
            </Grid>
        </Container>
    );
}

export default memo(WikiPage);