import { Table } from "semantic-ui-react";
import { memo, useMemo } from "react";
import { GameListGame } from "../../models/websocket/ServerGameList";
import {
  categoryToString,
  OnlineStatsRow,
  order,
  realmToCategory,
} from "../../config/PvpGNConfig";
import React from "react";

interface OnlineStatsProps {
  gameList: GameListGame[];
}

function OnlineStats({ gameList }: OnlineStatsProps) {
  const gameStats = useMemo<OnlineStatsRow[]>(() => {
    let stats: Map<String, OnlineStatsRow> = new Map();

    const appendToStats = (statsPart: OnlineStatsRow) => {
      const statsRow = stats.get(statsPart.categoryId);

      if (statsRow) {
        statsRow.lobbyCount += statsPart.lobbyCount;
        statsRow.playersCount += statsPart.playersCount;
      } else {
        stats.set(statsPart.categoryId, statsPart);
      }
    };

    gameList.forEach((game) => {
      // Process players

      let playersCount = 0;

      game.players.forEach((player) => {
        if (player.name.length === 0) return;

        playersCount++;

        if (!realmToCategory[player.realm])
          appendToStats({
            categoryId: "other",
            lobbyCount: 0,
            playersCount: 1,
          });
        else
          appendToStats({
            categoryId: realmToCategory[player.realm],
            lobbyCount: 0,
            playersCount: 1,
          });
      });

      if (game.gameFlags.started)
        appendToStats({ categoryId: "started", lobbyCount: 1, playersCount });
      else appendToStats({ categoryId: "lobby", lobbyCount: 1, playersCount });

      appendToStats({ categoryId: "all", lobbyCount: 1, playersCount });
    });

    return Array.from(stats.values()).sort((a, b) => {
      return order.indexOf(a.categoryId) - order.indexOf(b.categoryId);
    });
  }, [gameList]);

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Категория</Table.HeaderCell>
          <Table.HeaderCell>Игр</Table.HeaderCell>
          <Table.HeaderCell>Игроков</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {gameStats.map((gameStatsRow) => {
          return (
            <Table.Row key={gameStatsRow.categoryId}>
              <Table.Cell>
                {categoryToString[gameStatsRow.categoryId]}
              </Table.Cell>
              <Table.Cell>
                {gameStatsRow.lobbyCount > 0 ? gameStatsRow.lobbyCount : ""}
              </Table.Cell>
              <Table.Cell>{gameStatsRow.playersCount}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

export default memo(OnlineStats);
