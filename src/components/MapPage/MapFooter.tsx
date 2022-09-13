import { memo, useContext, useEffect, useState } from "react";
import { Button, Container, Form, Grid, Icon, Label } from "semantic-ui-react";
import { RestContext } from "../../context";
import { Category } from "../../models/rest/Category";
import { Map } from "../../models/rest/Map";
import byteSize from "byte-size";
import { createMedia } from "@artsy/fresnel";
import MapStats from "./MapStats";
import { GameListGame } from "../../models/websocket/ServerGameList";
import GameJoinButton from "./GameJoinButton";
import React from "react";
import MapDownloadButton from "./MapDownloadButton";
import MapCategoryList from "./MapCategoryList";
import { Link } from "react-router-dom";
import { AuthContext } from "./../../context/index";
import CloneConfigButton from "./CloneConfigButton";

interface MapFooterProps {
  gameList: GameListGame[];
}

function MapFooter({
  categories,
  downloadUrl,
  fileName,
  fileSize,
  id,
  gameList,
  configs,
}: Map & MapFooterProps) {
  const mapSize = byteSize(fileSize);

  const { accessMask, apiToken } = useContext(AuthContext).auth;

  const showCreateButton =
    apiToken.hasAuthority("MAP_READ") && accessMask.hasAccess(64);

  return (
    <>
      <Grid.Row>
        <MapCategoryList categories={categories} />
        <MapStats gameList={gameList} mapId={id || 0} />
      </Grid.Row>
      <Grid.Row>
        {downloadUrl && (
          <MapDownloadButton
            downloadUrl={downloadUrl}
            fileSize={fileSize}
            fileName={fileName}
            id={id || 0}
          />
        )}
        <GameJoinButton gameList={gameList} mapId={id || 0} />
        {showCreateButton && (
          <Button
            color="green"
            basic
            icon="plus"
            as={Link}
            to={`/create/confirm?mapId=${id}`}
          />
        )}
        <CloneConfigButton mapId={id || 0} configs={configs} />

        <Button color="green" basic icon="edit" floated="right" />
        <Button
          color="red"
          basic
          icon="warning"
          floated="right"
          as="a"
          href={`https://xgm.guru/p/irina/add/219?initial-text=%5B%2B%2B%D0%96%D0%B0%D0%BB%D0%BE%D0%B1%D0%B0%20%D0%BD%D0%B0%20%D0%BA%D0%B0%D1%80%D1%82%D1%83%2B%2B%5D%0A%0A%2A%2A%D0%9D%D0%BE%D1%80%D0%BC%D0%B5%20%D0%BA%D0%B0%D1%80%D1%82%D1%8B%3A%2A%2A%20%23${id}%20%0A%2A%2A%D0%9F%D1%80%D0%B8%D1%87%D0%B8%D0%BD%D0%B0%3A%2A%2A%20%28%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D1%8C%D1%82%D0%B5%20%D0%BE%D0%B4%D0%BD%D1%83%29%20%D1%83%D0%B4%D0%B0%D0%BB%D0%B8%D1%82%D1%8C%20%D0%BA%D0%B0%D1%80%D1%82%D1%83%2C%20%D0%BE%D0%B1%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D1%8C%20%D0%BA%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D0%B8%2C%20%D0%B7%D0%B0%D1%8F%D0%B2%D0%BA%D0%B0%20%D0%BD%D0%B0%20%D0%B2%D0%B5%D1%80%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%86%D0%B8%D1%8E%0A%2A%2A%D0%9A%D0%BE%D0%BC%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%B8%D0%B9%3A%2A%2A%20%0A`}
        />
      </Grid.Row>
    </>
  );
}

export default memo(MapFooter);
