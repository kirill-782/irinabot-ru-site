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
  TableRow
} from "semantic-ui-react";
import React from "react";

import prettyMilliseconds from "pretty-ms";

import "./ReplayMainInfo.scss";
import { AppRuntimeSettingsContext } from "../../context";
import LanguageKey from "../LanguageKey";

const PRODUCT_ID_TO_STRING = {
  1462982736: "Warcraft III TFT"
};

function ReplayMainInfo() {
  const { replayData, replayActions, name } = useContext(ReplayContext) || {};

  const getLeaveRowByPID = (pid?: number) => {
    return replayData?.records.playerLeave.find((i) => {
      return i.playerId === pid;
    });
  };

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  return (
    <Grid className="replay-main-info">
      <Grid.Row stretched>
        <Header>
          <LanguageKey stringId="replayMainInfo_1"/>
        </Header>
        <Segment className="fluid">
          <div>
            <LanguageKey stringId="replayMainInfo_2" value={replayData?.records.gameInfo?.gameName}/>
          </div>
          <div>
            <b>Product ID:</b>
            {PRODUCT_ID_TO_STRING[replayData?.subHeader.productId || 0]}
          </div>
          <div>
            <b>Version:</b>
            {replayData?.subHeader.version} build{" "}
            {replayData?.subHeader.buildNumber}
          </div>
          <div>
            <LanguageKey stringId="replayMainInfo_2" value={prettyMilliseconds(replayData?.subHeader.lengthMilis || 0)}/>
          </div>
          <div>
            <LanguageKey stringId="replayMainInfo_2" value={replayData?.records.gameInfo?.hostPlayer.playerName}/>
          </div>
        </Segment>
        <Header>
          <LanguageKey stringId="replayMainInfo_6" value={replayData?.records.gameInfo?.hostPlayer.playerName}/>
        </Header>
        <Table>
          <TableHeader>
            <TableHeaderCell>
              {t("replayMainInfo_7")}
            </TableHeaderCell>
            <TableHeaderCell>
              {t("replayMainInfo_8")}
            </TableHeaderCell>
            <TableHeaderCell>
              {t("replayMainInfo_9")}
            </TableHeaderCell>
          </TableHeader>
          <TableBody>
            {[
              ...(replayData?.records.players || []),
              replayData?.records.gameInfo?.hostPlayer
            ].map((i) => {
              const leftRow = getLeaveRowByPID(i?.playerId);

              return (
                <TableRow key={i?.playerId}>
                  <TableCell>{i?.playerName}</TableCell>
                  <TableCell>
                    {prettyMilliseconds(leftRow?.time || 0)}
                  </TableCell>
                  <TableCell>{leftRow?.result}</TableCell>
                </TableRow>
              );
            })}
            <TableRow></TableRow>
          </TableBody>
        </Table>
      </Grid.Row>
      <Grid.Row>
        <Message warning>{t("replayMainInfo_10")}</Message>
      </Grid.Row>
    </Grid>
  );
}

export default ReplayMainInfo;
