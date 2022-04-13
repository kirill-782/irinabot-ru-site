import { Button, Container, Grid, Icon, List, Popup } from "semantic-ui-react";
import { GameListPlayer } from "../../models/websocket/ServerGameList";
import { useEffect, useState } from "react";

const realmToText = {
  "178.218.214.114": "iCCup",
  connector: "IrInA Connector",
  "127.0.0.1": "Игрок другой платформы",
};

interface GameListPlayerItemProps {
  player: GameListPlayer;
}

interface GamePlayerStats {
  win: string;
  lose: string;
  percent: number;
  totalTime: number;
  apm: string;
}

function GameListPlayerItem({ player }: GameListPlayerItemProps) {
  const [gamePlayerStats, setGamePlayerStats] =
    useState<GamePlayerStats>(undefined);

  //https://nwc3l.com/irinabot_profile?id=zsef_He_yIIaJI&json

  const loadStats = () => {
    const urlParser = new URLSearchParams();
    urlParser.append("id", player.name);
    urlParser.append("json", "");
    fetch("https://nwc3l.com/irinabot_profile?" + urlParser.toString())
      .then((e) => {
        if (e.status === 200) {
          e.json()
            .then((data) => {
              setGamePlayerStats(data.playerInfo);
            })
            .catch((e) => {
              console.log(e);
            });
        } else setGamePlayerStats(null);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const renderStats = () => {
    if (gamePlayerStats === undefined) return <span>Загрузка статистики</span>;

    if (gamePlayerStats === null) return <span>Статистика не найдена</span>;

    return (
      <List horizontal>
        <List.Item style={{ color: "green" }}>
          Побед: {gamePlayerStats.win}
        </List.Item>
        <List.Item style={{ color: "red" }}>
          Поражений: {gamePlayerStats.lose}
        </List.Item>{" "}
        <List.Item>Винрейт: {gamePlayerStats.percent}%</List.Item>
        <List.Item>Часов наиграно: {gamePlayerStats.totalTime} ч.</List.Item>
        <List.Item style={{ color: "blue" }}>
          APM: {gamePlayerStats.apm}
        </List.Item>
      </List>
    );
  };

  return (
    <Popup
      on="click"
      onOpen={loadStats}
      trigger={
        <List.Item
          key={player.name}
          as="a"
          title={
            realmToText[player.realm] == undefined
              ? player.realm
              : realmToText[player.realm]
          }
        >
          {player.name}
        </List.Item>
      }
    >
      <Grid centered>
        <Grid.Row>{renderStats()}</Grid.Row>
        <Grid.Row>
          <Button size="mini">
            <Icon name="envelope"></Icon> Написать сообщение
          </Button>
        </Grid.Row>
      </Grid>
    </Popup>
  );
}

export default GameListPlayerItem;
