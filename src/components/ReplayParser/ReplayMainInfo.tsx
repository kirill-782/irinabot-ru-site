import { useContext } from "react";
import { ReplayContext } from "../Pages/ReplayParserPage";
import {
  Grid,
  Header,
  Message,
  Segment,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "semantic-ui-react";
import React from "react";

import prettyMilliseconds from "pretty-ms";

import "./ReplayMainInfo.scss";
import { AppRuntimeSettingsContext } from "../../context";

const PRODUCT_ID_TO_STRING = {
  1462982736: "Warcraft III TFT",
};

function ReplayMainInfo() {
  const { replayData, replayActions, name } = useContext(ReplayContext) || {};

  const getLeaveRowByPID = (pid?: number) => {
    return replayData?.records.playerLeave?.find((i) => {
      return i.record.playerId === pid;
    });
  };

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  return (
    <Grid className="replay-main-info">
      <Grid.Row stretched>
        <Header>{t("page.replay.info.map.base")}:</Header>
        <Segment className="fluid">
          <div>
            <b>{t("page.replay.info.map.gamename")}:</b>
            {replayData?.records.gameInfo?.gameName}
          </div>
          <div>
            <b>Product ID:</b>
            {PRODUCT_ID_TO_STRING[replayData?.subHeader.productId || 0]}
          </div>
          <div>
            <b>{t("page.replay.info.map.version")}:</b>
            {replayData?.subHeader.version} build{" "}
            {replayData?.subHeader.buildNumber}
          </div>
          <div>
            <b>{t("page.replay.info.map.duration")}: </b>
            {prettyMilliseconds(replayData?.subHeader.lengthMilis || 0)}
          </div>
          <div>
            <b>{t("page.replay.info.map.host")}: </b>
            {replayData?.records.gameInfo?.hostPlayer.playerName}
          </div>
        </Segment>
        <Header>{t("page.replay.info.map.players")}:</Header>
        <Table>
          <TableHeader>
            <TableHeaderCell>
              {t("page.replay.info.map.nickname")}
            </TableHeaderCell>
            <TableHeaderCell>
              {t("page.replay.info.map.gametime")}
            </TableHeaderCell>
            <TableHeaderCell>
              {t("page.replay.info.map.exitcode")}
            </TableHeaderCell>
          </TableHeader>
          <TableBody>
            {[
              ...(replayData?.records.players || []),
              replayData?.records.gameInfo?.hostPlayer,
            ].map((i) => {
              const leftRow = getLeaveRowByPID(i?.playerId);

              return (
                <TableRow key={i?.playerId}>
                  <TableCell>{i?.playerName}</TableCell>
                  <TableCell>
                    {prettyMilliseconds(leftRow?.time || 0)}
                  </TableCell>
                  <TableCell>{leftRow?.record.result}</TableCell>
                </TableRow>
              );
            })}
            <TableRow></TableRow>
          </TableBody>
        </Table>
      </Grid.Row>
      <Grid.Row>
        <Message warning>{t("page.replay.info.map.aqua")}</Message>
      </Grid.Row>
    </Grid>
  );
}

export default ReplayMainInfo;
