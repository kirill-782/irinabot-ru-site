export interface OnlineStatsRow {
    categoryType: "all" | "lobby" | "started" | "realm" | "patch" | "other";
    categoryArgument: string;
    lobbyCount: number;
    playersCount: number;
}

export const realmToCategory = {
    "178.218.214.114": "iccup",
    connector: "connector",
    "pvpgn.onligamez.ru": "ozbnet",
    "Rubattle.net": "rubattlenet",
    "server.eurobattle.net": "eurobattlenet",
};

export const realmCategoryToRealmName = {
    iccup: "iCCup",
    connector: "IrInA Connector",
    ozbnet: "OZBnet",
    rubattlenet: "RuBattle.Net",
    eurobattlenet: "EuroBattle.Net",
}

const categoryOrder = [
    "all",
    "lobby",
    "started",
    "realm",
    "other",
    "patch",
];


const platformOrder = [
    "connector",
    "iccup",
    "ozbnet",
    "rubattlenet",
    "eurobattlenet",
];

const compareByType = (a: OnlineStatsRow, b: OnlineStatsRow) => {
    return categoryOrder.indexOf(a.categoryType) - categoryOrder.indexOf(b.categoryType);
};

const compareByRealmType = (a: OnlineStatsRow, b: OnlineStatsRow) => {
    return platformOrder.indexOf(a.categoryType) - platformOrder.indexOf(b.categoryType);
};

const compareByPatchType = (a: OnlineStatsRow, b: OnlineStatsRow) => {
    return b.playersCount - a.playersCount;
};

export const statsRowComparator = (a: OnlineStatsRow, b: OnlineStatsRow) => {
    let secondOrder;

    if (a.categoryType === "patch" && b.categoryType === "patch") {
        secondOrder = compareByPatchType;
    } else if (a.categoryType === "realm" && b.categoryType === "realm") {
        secondOrder = compareByRealmType;
    }

    return (
        compareByType(a, b) ||
        (secondOrder ? secondOrder(a, b) : 0)
    );
};