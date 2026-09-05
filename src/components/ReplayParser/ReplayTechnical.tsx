import React, { useContext } from "react";
import { Grid, Header, Label, Segment, Table } from "semantic-ui-react";
import prettyMilliseconds from "pretty-ms";

import { ReplayContext } from "../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";
import ReplayFieldTable from "./ReplayFieldTable";
import {
    formatBytes,
    formatFourCC,
    formatHex,
    formatUint32Hex,
    formatVersion,
    getGameModeKey,
    getGameTypeFlagKeys,
    getReforgedProfiles,
    getRecordKey,
    RECORD_CHECKSUM,
    RECORD_REFORGED_METADATA,
} from "../../utils/ReplayFormat";

// Флаг 0x8000 в подзаголовке означает сетевую игру, 0x0000 — одиночную.
const SUB_HEADER_FLAG_MULTIPLAYER = 0x8000;

function ReplayTechnical() {
    const { replayData } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const { header, subHeader, records } = replayData;

    const recordCounts = new Map<number, number>();
    records.records.forEach((record) => recordCounts.set(record.type, (recordCounts.get(record.type) || 0) + 1));

    const checksums = records.others.filter((record) => record.type === RECORD_CHECKSUM);
    const profiles = [...getReforgedProfiles(replayData).values()];
    const reforgedMetadata = records.others.filter((record) => record.type === RECORD_REFORGED_METADATA);


    return (
        <Grid className="replay-technical" stackable>
            <Grid.Row columns={2}>
                <Grid.Column>
                    <Header size="small">{t("replayTechnicalGameHeader")}</Header>
                    <Segment>
                        <ReplayFieldTable
                            fields={[
                                {
                                    label: t("replayTechnicalProduct"),
                                    value: `${formatFourCC(subHeader.productId)} (${subHeader.productId})`,
                                },
                                { label: t("replayTechnicalVersion"), value: formatVersion(subHeader.version) },
                                { label: t("replayTechnicalBuild"), value: subHeader.buildNumber },
                                {
                                    label: t("replayTechnicalClient"),
                                    value: (
                                        <Label
                                            size="tiny"
                                            basic
                                            color={replayData.isReforged ? "teal" : "grey"}
                                            content={
                                                replayData.isReforged
                                                    ? t("replayTechnicalReforged")
                                                    : t("replayTechnicalClassic")
                                            }
                                        />
                                    ),
                                },
                                {
                                    label: t("replayTechnicalMode"),
                                    value:
                                        (subHeader.flags & SUB_HEADER_FLAG_MULTIPLAYER) === SUB_HEADER_FLAG_MULTIPLAYER
                                            ? t("replayTechnicalMultiplayer")
                                            : t("replayTechnicalSinglePlayer"),
                                },
                                {
                                    label: t("replayTechnicalLength"),
                                    value: prettyMilliseconds(subHeader.lengthMilis),
                                },
                                {
                                    label: t("replayTechnicalTimeSlotsLength"),
                                    value: prettyMilliseconds(records.duration),
                                },
                                { label: t("replayTechnicalCrc32"), value: <code>{formatHex(subHeader.crc32)}</code> },
                                { label: t("replayTechnicalLanguageId"), value: records.gameInfo?.languageId },
                                {
                                    // Хостбот пишет сюда константу, а не реальные настройки игры,
                                    // поэтому флаги живут здесь, среди сырых полей, а не в обзоре.
                                    label: t("replayTechnicalGameFlags"),
                                    value: records.gameInfo && (
                                        <>
                                            <code>0x{formatUint32Hex(records.gameInfo.gameType)}</code>
                                            {getGameTypeFlagKeys(records.gameInfo.gameType).map((key) => (
                                                <Label key={key} size="tiny" basic content={t(key)} />
                                            ))}
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </Segment>
                </Grid.Column>
                <Grid.Column>
                    <Header size="small">{t("replayTechnicalFileHeader")}</Header>
                    <Segment>
                        <ReplayFieldTable
                            fields={[
                                { label: t("replayTechnicalHeaderVersion"), value: header.headerVersion },
                                { label: t("replayTechnicalFirstBlockOffset"), value: header.firstBlockOffset },
                                { label: t("replayTechnicalBlockCount"), value: header.blockCount },
                                { label: t("replayTechnicalFileSize"), value: formatBytes(header.compressedSize) },
                                {
                                    label: t("replayTechnicalDecompressedSize"),
                                    value: formatBytes(header.decompressedSize),
                                },
                                { label: t("replayTechnicalRandomSeed"), value: records.startInfo?.randomSeed },
                                {
                                    label: t("replayTechnicalGameMode"),
                                    value:
                                        records.startInfo &&
                                        `${t(getGameModeKey(records.startInfo.gameMode))} (${records.startInfo.gameMode})`,
                                },
                                { label: t("replayTechnicalStartSpots"), value: records.startInfo?.startSpotCount },
                            ]}
                        />
                    </Segment>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={2}>
                <Grid.Column>
                    <Header size="small">{t("replayTechnicalRecordsHeader")}</Header>
                    <Segment>
                        <Table basic="very" compact="very" unstackable>
                            <Table.Body>
                                {Array.from(recordCounts.entries())
                                    .sort((a, b) => a[0] - b[0])
                                    .map(([type, count]) => (
                                        <Table.Row key={type}>
                                            <Table.Cell collapsing>
                                                <code>0x{type.toString(16).padStart(2, "0")}</code>
                                            </Table.Cell>
                                            <Table.Cell>{t(getRecordKey(type))}</Table.Cell>
                                            <Table.Cell collapsing textAlign="right">
                                                {count}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                            </Table.Body>
                        </Table>
                    </Segment>
                </Grid.Column>
                <Grid.Column>
                    <Header size="small">{t("replayTechnicalChecksumsHeader")}</Header>
                    <Segment>
                        <ReplayFieldTable
                            fields={[
                                { label: t("replayTechnicalChecksumCount"), value: checksums.length },
                                {
                                    label: t("replayTechnicalChecksumFirst"),
                                    value: checksums.length ? (
                                        <code>
                                            {checksums
                                                .slice(0, 4)
                                                .map((record) =>
                                                    formatUint32Hex((record as { checksum: number }).checksum)
                                                )
                                                .join(" ")}
                                        </code>
                                    ) : undefined,
                                    hideWhenEmpty: true,
                                },
                                {
                                    label: t("replayTechnicalReforgedMetadataCount"),
                                    value: reforgedMetadata.length || undefined,
                                    hideWhenEmpty: true,
                                },
                                {
                                    label: t("replayTechnicalReforgedProfiles"),
                                    value: profiles.length ? (
                                        <>
                                            {profiles.map((profile) => (
                                                <div key={profile.playerId}>
                                                    {profile.battleTag}
                                                    {profile.avatar && (
                                                        <Label size="tiny" basic content={profile.avatar} />
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    ) : undefined,
                                    hideWhenEmpty: true,
                                },
                            ]}
                        />
                    </Segment>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

export default ReplayTechnical;
