export interface OnlineStatsRow {
  categoryId: string;
  lobbyCount: number;
  playersCount: number;
}

export const realmToCategory = {
  "178.218.214.114": "iccup",
  connector: "connector",
  "pvpgn.onligamez.ru": "ozbnet",
  "Rubattle.net": "rubattlenet",
  "server.eurobattle.net": "eurobattlenet"
};

export const categoryToString = {
  iccup: "Игроков с iCCup",
  ozbnet: "Игроков с OZBnet",
  rubattlenet: "Игроков с RuBattle.Net",
  eurobattlenet: "Игроков с EuroBattle.Net",
  connector: "Игроков с IrInA Connector	",
  other: "Игроки с остальных платфром	",
  all: "Всего",
  lobby: "Лобби",
  started: "Начатые игры",
};

export const order = ["all", "lobby", "started", "connector", "iccup", "ozbnet", "rubattlenet", "eurobattlenet", "other"];