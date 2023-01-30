import React, { useContext } from "react";
import { Item } from "semantic-ui-react";
import GameListPlayerItem from "../GameList/GameListPlayerItem";
import { ReplayContext } from "../Pages/ReplayParserPage";

import prettyMilliseconds from "pretty-ms";

import "./ChatTab.scss";

const getClassColorByPlayer = (colour) => {
  switch (colour) {
    case 0:
      return "red";
    case 1:
      return "blue";
    case 2:
      return "teal";
    case 3:
      return "purple";
    case 4:
      return "yellow";
    case 5:
      return "orange";
    case 6:
      return "green";
    case 7:
      return "pink";
    case 8:
      return "gray";
    case 9:
      return "light-blue";
    case 10:
      return "dark-green";
    case 11:
      return "brown";
    case 12:
      return "maroon";
    case 13:
      return "navy";
    case 14:
      return "turquoise";
    case 15:
      return "violet";
    case 16:
      return "wheat";
    case 17:
      return "peach";
    case 18:
      return "mint";
    case 19:
      return "leavender";
    case 20:
      return "coal";
    case 21:
      return "snow";
    case 22:
      return "emerald";
    case 23:
      return "peanut";
    default:
      return "";
  }
};

function ChatTab() {
  const { replayData, replayActions, name } = useContext(ReplayContext) || {};

  const getSlotFromPid = (pid?: number) => {
    return replayData?.records.startInfo?.slots.find((i) => {
      return i.playerId === pid;
    });
  };

  const getPlayerByPid = (pid?: number) => {
    if (replayData?.records.gameInfo?.hostPlayer.playerId === pid)
      return replayData?.records.gameInfo?.hostPlayer;

    return replayData?.records.players.find((i) => {
      return i.playerId === pid;
    });
  };

  return (
    <div className="replay-chat-tab">
      {replayData?.records.chatMessages.map((i, k) => {
        const player = getPlayerByPid(i.playerId);
        const slot = getSlotFromPid(i.playerId);

        return (
          <div key={k} className="chat-row">
            <span className="time">({prettyMilliseconds(i.time)})</span>
            <Item
              as="a"
              className={`player-name ${getClassColorByPlayer(slot?.color)}`}
            >
              {player?.playerName}
            </Item>
            <span>{i.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export default ChatTab;
