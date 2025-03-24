import { memo, useContext, useState } from "react";
import { Button, Grid, Label } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import MapStats from "./MapStats";
import { GameListGame } from "../../models/websocket/ServerGameList";
import MapGameJoinButton from "./MapGameJoinButton";
import React from "react";
import MapDownloadButton from "./MapDownloadButton";
import MapCategoryList from "./MapCategoryList";
import { Link } from "react-router-dom";
import { AppRuntimeSettingsContext, AuthContext, MapContext } from "../../context";
import CloneConfigButton from "./CloneConfigButton";
import "./MapFooter.scss";
import MapFavoriteButton from "./FavoriteButton";
import LanguageKey from "../LanguageKey";

interface MapFooterProps {
}

function MapFooter({ }: MapFooterProps) {
    const { accessMask, apiToken } = useContext(AuthContext).auth;

    const { language } = useContext(AppRuntimeSettingsContext);
    const g = language.getString;

    const { categories, downloadUrl, fileName, fileSize, id, configs, favorite, owner, mapStats } =
        useContext(MapContext).map;

    const showCreateButton = apiToken.hasAuthority("MAP_READ") && accessMask.hasAccess(64);

    const [reportModalOpen, setReportModalOpen] = useState(false);

    const flagsRequiredAccess = owner ? "MAP_FLAGS_EDIT" : "MAP_FLAGS_EDIT_GLOBAL";

    const canEdit = apiToken.hasAuthority(flagsRequiredAccess);

    return (
        <>
            <Grid.Row>
                <MapCategoryList categories={categories} />
                {mapStats && (
                    <>
                        <Label title={g("mapStatsHint", { month: mapStats.monthGames, week: mapStats.weekGames })}>
                            <LanguageKey stringId="mapStatsTotalGames" value={mapStats.totalGames}></LanguageKey>
                        </Label>
                        <Label title={g("mapStatsHint", { month: mapStats.monthPlayers, week: mapStats.weekPlayers })}>
                            <LanguageKey stringId="mapStatsTotalPlayers" value={mapStats.totalPlayers}></LanguageKey>
                        </Label>
                        <Label title={g("mapStatsHint", { month: mapStats.monthUniquePlayers, week: mapStats.weekUniquePlayers })}>
                            <LanguageKey stringId="mapStatsTotalUniquePlayers" value={mapStats.totalUniquePlayers}></LanguageKey>
                        </Label>
                    </>
                )}
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
                <MapGameJoinButton className="centred" mapId={id || 0} />
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
