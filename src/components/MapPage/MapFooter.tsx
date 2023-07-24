import { memo, useContext, useState } from "react";
import { Button, Grid } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import MapStats from "./MapStats";
import { GameListGame } from "../../models/websocket/ServerGameList";
import GameJoinButton from "./GameJoinButton";
import React from "react";
import MapDownloadButton from "./MapDownloadButton";
import MapCategoryList from "./MapCategoryList";
import { Link } from "react-router-dom";
import { AuthContext, MapContext } from "../../context";
import CloneConfigButton from "./CloneConfigButton";
import "./MapFooter.scss";
import MapFavoriteButton from "./FavoriteButton";

interface MapFooterProps {
    gameList: GameListGame[];
}

function MapFooter({ gameList }: MapFooterProps) {
    const { accessMask, apiToken } = useContext(AuthContext).auth;

    const { categories, downloadUrl, fileName, fileSize, id, configs, favorite, owner } = useContext(MapContext).map;

    const showCreateButton = apiToken.hasAuthority("MAP_READ") && accessMask.hasAccess(64);

    const [reportModalOpen, setReportModalOpen] = useState(false);

    const flagsRequiredAccess = owner ? "MAP_FLAGS_EDIT" : "MAP_FLAGS_EDIT_GLOBAL";

    const canEdit = apiToken.hasAuthority(flagsRequiredAccess);

    return (
        <>
            <Grid.Row>
                <MapCategoryList categories={categories} />
                <MapStats gameList={gameList} mapId={id || 0} />
            </Grid.Row>
            <Grid.Row className="map-footer-buttons" verticalAlign="middle">
                {downloadUrl && (
                    <MapDownloadButton
                        className="centred"
                        downloadUrl={downloadUrl}
                        fileSize={fileSize}
                        fileName={fileName}
                        id={id || 0}
                    />
                )}
                <GameJoinButton className="centred" gameList={gameList} mapId={id || 0} />
                {showCreateButton && (
                    <Button
                        className="centred"
                        color="green"
                        basic
                        icon="plus"
                        as={Link}
                        to={`/create/confirm?mapId=${id}`}
                    />
                )}
                <div className="divider"></div>

                {apiToken.hasToken() && <MapFavoriteButton />}
                {canEdit && (
                    <Button className="centred" color="green" basic icon="pencil" as={Link} to={`/maps/${id}/edit`} />
                )}

                {apiToken.hasAuthority("CONFIG_CREATE") && (
                    <CloneConfigButton className="centred" mapId={id || 0} configs={configs} />
                )}
                <Button
                    className="centred"
                    color="red"
                    basic
                    icon="warning"
                    onClick={() => {
                        setReportModalOpen(true);
                    }}
                />
            </Grid.Row>
        </>
    );
}

export default memo(MapFooter);
