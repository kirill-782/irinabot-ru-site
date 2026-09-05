import React, { useContext } from "react";
import { Grid, Header, Icon, Label, Segment } from "semantic-ui-react";
import prettyMilliseconds from "pretty-ms";

import { ReplayContext } from "../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";
import ReplayFieldTable from "./ReplayFieldTable";
import WarcraftIIIText from "../WarcraftIIIText";
import {
    formatHex,
    getMapFileName,
    getObserverModeKey,
    getSpeedKey,
    getVisibilityKey,
    isPrivateGame,
} from "../../utils/ReplayFormat";
import { parseHCL } from "../../utils/HCLParser";

function ReplayOverview() {
    const { replayData } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const gameInfo = replayData.records.gameInfo;
    const statString = gameInfo?.statString;
    const hcl = parseHCL(replayData.records.startInfo?.slots);

    const isPrivate = isPrivateGame(gameInfo?.gameType);

    const yesNo = (value?: boolean) => (
        <Label size="tiny" basic color={value ? "green" : "grey"} content={value ? t("yes") : t("no")} />
    );

    return (
        <Grid className="replay-overview" stackable>
            <Grid.Row columns={2}>
                <Grid.Column>
                    <Header size="small">{t("replayOverviewGameHeader")}</Header>
                    <Segment>
                        <ReplayFieldTable
                            fields={[
                                {
                                    label: t("replayOverviewGameName"),
                                    value: gameInfo && (
                                        <>
                                            <WarcraftIIIText>{gameInfo.gameName}</WarcraftIIIText>
                                            {isPrivate && (
                                                <Label
                                                    size="tiny"
                                                    color="orange"
                                                    basic
                                                    content={t("replayOverviewPrivateGame")}
                                                />
                                            )}
                                        </>
                                    ),
                                },
                                {
                                    // Это не хост: и клиент, и хостбот пишут в запись 0x00 того, чьими
                                    // глазами сохранён реплей (бот — последнего вышедшего игрока).
                                    label: t("replayOverviewSaver"),
                                    value: gameInfo && (
                                        <WarcraftIIIText>{gameInfo.hostPlayer.playerName}</WarcraftIIIText>
                                    ),
                                },
                                { label: t("replayOverviewCreator"), value: statString?.creator },
                                { label: t("replayOverviewPlayersCount"), value: gameInfo?.playersCount },
                                {
                                    label: t("replayOverviewDuration"),
                                    value: prettyMilliseconds(replayData.subHeader.lengthMilis),
                                },
                                {
                                    label: t("replayOverviewHcl"),
                                    value: hcl.hasHcl ? <code>{hcl.commandString}</code> : undefined,
                                    hideWhenEmpty: true,
                                },
                                {
                                    label: t("replayOverviewPrivateString"),
                                    value: gameInfo?.privateString,
                                    hideWhenEmpty: true,
                                },
                            ]}
                        />
                    </Segment>
                </Grid.Column>
                <Grid.Column>
                    <Header size="small">{t("replayOverviewMapHeader")}</Header>
                    <Segment>
                        <ReplayFieldTable
                            fields={[
                                { label: t("replayOverviewMapName"), value: getMapFileName(statString?.mapPath) },
                                { label: t("replayOverviewMapPath"), value: statString?.mapPath },
                                {
                                    label: t("replayOverviewMapSize"),
                                    value: statString && `${statString.mapWidth} × ${statString.mapHeight}`,
                                },
                                {
                                    label: t("replayOverviewMapChecksum"),
                                    value: <code>{formatHex(statString?.mapChecksum)}</code>,
                                },
                                {
                                    label: t("replayOverviewMapChecksumSha1"),
                                    value: <code className="sha1">{formatHex(statString?.mapChecksumSha1)}</code>,
                                },
                            ]}
                        />
                    </Segment>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                    <Header size="small">{t("replayOverviewSettingsHeader")}</Header>
                    <Segment>
                        <ReplayFieldTable
                            fields={[
                                {
                                    label: t("replayOverviewSpeed"),
                                    value: statString && t(getSpeedKey(statString.speed)),
                                },
                                { label: t("replayOverviewVisibility"), value: t(getVisibilityKey(statString)) },
                                { label: t("replayOverviewObservers"), value: t(getObserverModeKey(statString)) },
                                { label: t("gameOptionsTeamsTogether"), value: yesNo(statString?.teamsTogether) },
                                { label: t("gameOptionsLockTeams"), value: yesNo(statString?.fixedTeams) },
                                {
                                    label: t("gameOptionsFullSharedUnitControl"),
                                    value: yesNo(statString?.fullSharedUnitControl),
                                },
                                { label: t("gameOptionsRandomHeros"), value: yesNo(statString?.randomHero) },
                                { label: t("gameOptionsRandomRaces"), value: yesNo(statString?.randomRaces) },
                            ]}
                        />
                    </Segment>
                </Grid.Column>
            </Grid.Row>
            {!gameInfo && (
                <Grid.Row>
                    <Grid.Column>
                        <Segment placeholder textAlign="center">
                            <Icon name="warning sign" />
                            {t("replayOverviewNoGameInfo")}
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
            )}
        </Grid>
    );
}

export default ReplayOverview;
